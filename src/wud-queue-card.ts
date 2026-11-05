/**
 * A dashboard card for What's Up Docker's container updates. The containers are grouped by compose
 * project, and services of one project that run the same image are one row, installed together.
 *
 * Two sections share the card: the updates waiting, and the containers already up to date. Only one is
 * open at a time; the other is a single row that opens it. Rows are listed in the order they should be
 * installed, with WUD's own container last.
 *
 * Installing calls `update.install` on the row's entities. The card keeps an eye on what it started, so
 * an install that fails shows on its row while the card is open; WUD itself reports no failures.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CARD_VERSION, DONE_KEEP } from "./const";
import {
    containerOf,
    follow,
    followQueue,
    isWud,
    projectsOf,
    queueEntityId,
    queueOf,
    retryable,
    selectedEntities,
    servicesDone,
} from "./containers";
import type { Followed, Install } from "./containers";
import "./editor";
import { ScrollFade, fadeStyles } from "./fade";
import type { HomeAssistant } from "./hass";
import { gridMinRows, heightCardSize, heightStyle, validHeight } from "./height";
import { browserLanguage, translate } from "./localize/localize";
import { drawnScale, fillLimit, filledHeight, filledStyle, spareRoom, validRowStep } from "./rows";
import type { Container, Project, Queue, Unit, WudQueueCardConfig } from "./types";

console.info(
    `%c  WUD-QUEUE-CARD \n%c  ${CARD_VERSION}    `,
    "color: orange; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray",
);

interface CardRegistration {
    type: string;
    name: string;
    description: string;
    documentationURL?: string;
    preview?: boolean;
}

const registry = window as unknown as { customCards?: CardRegistration[] };
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
    type: "wud-queue-card",
    name: translate(browserLanguage(), "common.name"),
    description: translate(browserLanguage(), "common.description"),
    documentationURL: "https://github.com/jesmak/wud-queue-card",
    preview: true,
});

type Section = "pending" | "current";

/**
 * The parts of a held card besides its first waiting row: the header with the round button of a narrow card, the status
 * line kept to one line, the progress bar, the list's top padding, both section lines, the open section's bottom padding
 * and the card's border.
 */
const HELD_FRAME_PX = 44 + 14 + 12 + 6 + 2 * 34 + 4 + 2;

/**
 * The most the first waiting row needs on a held card this wide or wider, at any width from there up: a compose project's
 * label and its first row, with a 19-character name and 22-character versions, the row queued or updating, wrapping as the
 * width needs. Measured held, with the scrollbar, from 140 px up. The worst is just under 300 px, where the narrow layout
 * still holds. A card narrower than its columns allow (in a stack, or by a theme) takes the steps below 214.
 */
const FIRST_ROW_PX: [number, number][] = [
    [214, 126],
    [180, 134],
    [160, 152],
    [150, 222],
    [0, 313],
];

/**
 * Docker was first released in March 2013 (v0.1.0). An image dated before that year carries a reproducible build's
 * placeholder, such as 1970-01-01.
 */
const DOCKER_EPOCH = Date.UTC(2013, 0, 1);

const px = (value: string) => parseFloat(value) || 0;

/**
 * Room for a measure read in fractions of a pixel, so a text exactly as wide as its room still fits. Smaller than the
 * 1/64 px a browser lays out in.
 */
const SLACK_PX = 0.01;

/** The large check under a held card's one line and the room under it, as in its styles: 100 px and 20 px. */
const LARGE_CHECK_PX = 120;

/** The parts the card itself puts in its ha-card, one after another. */
const CARD_PARTS = [".hd", ".hd-sub", ".bar", ".list", ".idle", ".message"].map((part) => `:scope > ${part}`).join(", ");

/**
 * The list's height once its folds have slid open or shut, so the card is on its rows as a slide begins. A shut fold ends
 * at nothing, an open one at its content, measured from where its last part ends, as its box is clipped while it slides.
 * Drawn sizes are divided by the card's `scale`, as its paddings and margins are in the layout's pixels.
 */
export function listEndHeight(list: HTMLElement, scale = 1): number {
    const style = getComputedStyle(list);
    let height = px(style.paddingTop) + px(style.paddingBottom);
    for (const child of list.children) {
        const part = child as HTMLElement;
        const partStyle = getComputedStyle(part);
        // Its own margins too, such as the room a held card keeps under an open section that is the list's last part.
        const margins = px(partStyle.marginTop) + px(partStyle.marginBottom);
        if (!part.classList.contains("fold")) {
            height += margins + part.getBoundingClientRect().height / scale;
            continue;
        }
        const inner = part.firstElementChild as HTMLElement | null;
        const content = inner?.firstElementChild as HTMLElement | null;
        const last = content?.lastElementChild as HTMLElement | null;
        if (!part.classList.contains("open") || !content || !last) {
            continue;
        }
        const contentStyle = getComputedStyle(content);
        height +=
            margins +
            (last.getBoundingClientRect().bottom - content.getBoundingClientRect().top) / scale +
            px(getComputedStyle(last).marginBottom) +
            px(contentStyle.paddingBottom);
    }
    return height;
}

/** Whether a row is installing, by WUD's word or by the install the card or the queue follows. */
function running(unit: Unit, followed: Map<string, Followed>): boolean {
    return unit.installing || followed.get(unit.key)?.status === "running";
}

@customElement("wud-queue-card")
export class WudQueueCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    /** Set by the dashboard: "grid" in a sections view. */
    @property({ attribute: false }) public layout?: string;
    @state() private config?: WudQueueCardConfig;
    /** The open section. Until one is chosen, the waiting updates are open when there are any. */
    @state() private open?: Section | "none";
    /** The installs this card started, by row, until the page is reloaded. */
    @state() private installs = new Map<string, Install>();
    @state() private now = Date.now();
    private timer?: number;
    /** Each container as last seen with a usable entity, for while WUD recreates it. */
    private known = new Map<string, Container>();
    /** Whether anything was waiting at the last update, to notice when the first update comes in. */
    private hadPending?: boolean;
    /** A queue action sent and not yet answered. Its button stays disabled meanwhile, so the press shows. */
    @state() private acting = false;
    /** While the sections slide, the lists don't scroll, so no scrollbar flashes as one grows. */
    @state() private sliding = false;
    private slideTimer?: number;
    /** On automatic rows in a sections view, the height that ends on the card's row step, and what of it the content leaves over. */
    @state() private filled = 0;
    @state() private spare = 0;
    /** The card's width when last measured, 0 before it is drawn. */
    @state() private width = 0;
    /** As last measured, whether the waiting rows' versions fit beside their names. */
    @state() private beside = false;
    /** As last measured, whether the room under a held card's one line fits the large check with its lines. */
    @state() private largeCheck = false;
    private frame?: number;
    private readonly resizes = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => this.measureSoon());
    /** How each remembered install is going, worked out once per update. */
    private followed = new Map<string, Followed>();
    /** The projects to show, worked out once per update. */
    private projectList: Project[] = [];

    constructor() {
        super();
        // Fades the edges of what scrolls while the card is held to a height, the open section or the lines under the shut one,
        // through the card's own lifecycle.
        new ScrollFade(this, () => (this.heightStyle() ? this.renderRoot.querySelectorAll<HTMLElement>(".fold.open .scroll, .idle") : []));
    }

    public static getConfigElement(): HTMLElement {
        return document.createElement("wud-queue-card-editor");
    }

    public static getStubConfig(): Record<string, unknown> {
        return {};
    }

    public setConfig(config: WudQueueCardConfig): void {
        // One entity may be written without a list around it.
        const list = (value: unknown): string[] | undefined => {
            if (value === undefined || (Array.isArray(value) && value.every((v) => typeof v === "string"))) {
                return value as string[] | undefined;
            }
            if (typeof value === "string") {
                return [value];
            }
            throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
        };
        if (!config) {
            throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
        }
        const entities = list(config.entities);
        const exclude = list(config.exclude);
        if (!validHeight(config)) {
            throw new Error(translate(browserLanguage(), "common.invalid_height"));
        }
        if (!validRowStep(config)) {
            throw new Error(translate(browserLanguage(), "common.invalid_row_step"));
        }
        this.config = { ...config, entities, exclude };
    }

    public getCardSize(): number {
        const pending = this.projects()
            .flatMap((p) => p.units)
            .filter((u) => u.pending).length;
        return heightCardSize(this.config ?? {}, 2 + Math.min(pending, 6), this.minimumHeight());
    }

    // No max_columns: a long version or digest has room to stay on one line in a wide card. Below 9 columns, a waiting row in
    // a compose project has too little room left for its name beside the project's indent, its icon and its button.
    public getGridOptions(): Record<string, unknown> {
        return { columns: 12, min_columns: 9, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
    }

    /**
     * Held to a height, the header, the status line, the progress bar, both section lines and the first waiting row with its
     * project's label still fit, at any width the card's 9 columns or more allow, or at its measured width if narrower. The
     * texts above the open section keep to one line then.
     */
    private minimumHeight(): number {
        const width = this.width || Infinity;
        return HELD_FRAME_PX + FIRST_ROW_PX.find(([least]) => width >= least)![1];
    }

    private heightStyle(): string {
        return heightStyle(this.config ?? {}, this.layout, this.minimumHeight());
    }

    public connectedCallback(): void {
        super.connectedCallback();
        // The clock stops while the card is away, such as on another view. Catch up and restart it.
        this.now = Date.now();
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        window.clearInterval(this.timer);
        this.timer = undefined;
        // The timer that would have ended the slide is gone, so a card that comes back mustn't still think it slides.
        window.clearTimeout(this.slideTimer);
        this.sliding = false;
        this.resizes?.disconnect();
        cancelAnimationFrame(this.frame ?? 0);
    }

    protected updated(): void {
        if (!this.isConnected) {
            return;
        }
        const card = this.renderRoot.querySelector("ha-card");
        if (card) {
            this.resizes?.observe(card);
        }
        this.measureSoon();
    }

    private measureSoon(): void {
        cancelAnimationFrame(this.frame ?? 0);
        this.frame = requestAnimationFrame(() => {
            // A layout that changes is drawn on the next render, which measures again. Rows filled to the one still drawn
            // would hold the card at a wrong height for a frame.
            if (this.measureBeside() && this.measureIdle()) {
                this.fillRows();
            }
        });
    }

    /**
     * Held to a set height with nothing waiting, the check under the line is the large one when the room fits it with its
     * lines, so the room doesn't scroll for it. The room's height comes from the card and the lines' from its width, so
     * neither changes with the check's size and the choice can't flip back and forth. Returns false when the layout changed.
     */
    private measureIdle(): boolean {
        const idle = this.renderRoot.querySelector<HTMLElement>("ha-card > .idle");
        const lines = idle?.querySelector<HTMLElement>(":scope > .idle-lines");
        if (!idle?.clientHeight || !lines) {
            return true;
        }
        const style = getComputedStyle(idle);
        const room = idle.clientHeight - px(style.paddingTop) - px(style.paddingBottom);
        const large = LARGE_CHECK_PX + px(style.rowGap) + px(getComputedStyle(lines).height) <= room + SLACK_PX;
        if (large === this.largeCheck) return true;
        this.largeCheck = large;
        return false;
    }

    /**
     * Puts the waiting rows' versions beside their names only when they fit there: when a name's longest word, the gap and
     * the whole version fit in the row's texts, and no row is taller than with its version under its name. Then every
     * waiting row, a shut section's included, so the list keeps one layout. The list is held to its drawn height meanwhile,
     * its overflow clipped, so nothing around it moves, and a section that scrolls is put back where it was.
     * Returns false when the layout changed.
     */
    private measureBeside(): boolean {
        const card = this.renderRoot.querySelector<HTMLElement>("ha-card");
        const list = card?.querySelector<HTMLElement>(":scope > .list");
        const infos = list ? [...list.querySelectorAll<HTMLElement>(".row.unit > .info")] : [];
        if (!card || !list?.clientWidth || infos.length === 0) {
            if (this.beside && card?.clientWidth) {
                this.beside = false;
            }
            return true;
        }
        const heights = (): number[] => infos.map((info) => px(getComputedStyle(info).height));
        const was = card.classList.contains("beside");
        const scrollers = [...list.querySelectorAll<HTMLElement>(".scroll")].map((scroll) => [scroll, scroll.scrollTop] as const);
        // A computed height has six significant digits, which can fall short of the 1/64 px a browser lays out in, and the
        // list held to that would shrink by a fraction while it is measured. So it is held to the 1/64 px it rounds to.
        list.style.height = `${Math.round(px(getComputedStyle(list).height) * 64) / 64}px`;
        list.style.overflow = "hidden";
        list.style.overflowAnchor = "none";
        card.classList.remove("beside");
        const under = heights();
        card.classList.add("beside");
        const sideBySide = heights();
        card.classList.add("measuring");
        // A narrow card's rows lay their texts out on a grid of their own, with no box for the texts to measure.
        const fits = infos.every((info, i) => {
            const style = getComputedStyle(info);
            if (style.display !== "flex") {
                return false;
            }
            const parts = [...info.children].reduce((sum, part) => sum + px(getComputedStyle(part).width), 0);
            return parts + px(style.columnGap) <= px(style.width) + SLACK_PX && sideBySide[i] <= under[i] + SLACK_PX;
        });
        card.classList.remove("measuring");
        card.classList.toggle("beside", was);
        list.style.height = "";
        list.style.overflow = "";
        list.style.overflowAnchor = "";
        // Rows measured shorter shrink what a section can scroll, and the browser pulls a section scrolled deep back up.
        for (const [scroll, top] of scrollers) {
            if (scroll.scrollTop !== top) {
                scroll.scrollTop = top;
            }
        }
        if (fits === this.beside) return true;
        this.beside = fits;
        return false;
    }

    /**
     * In a sections view whose rows are left automatic, the card takes the whole rows its content needs, or the half rows
     * with `row_step: half`, so the cards under it stay on the rows, up to the limit of a card that grows up to one. The
     * room left over goes under the status line, or under the
     * progress bar while the queue has one.
     * Measured to where the folds' slides end rather than where they are, so the card is on its rows as a slide begins.
     */
    private fillRows(): void {
        const card = this.renderRoot.querySelector<HTMLElement>("ha-card");
        if (!card || !card.clientWidth) {
            return;
        }
        const scale = drawnScale(card);
        // The card's whole width, border included, as the widths the columns give are, unscaled.
        const width = Math.round(card.getBoundingClientRect().width / scale);
        if (width !== this.width) {
            this.width = width;
        }
        const limit = fillLimit(this.config ?? {}, this.layout, this.minimumHeight());
        if (!limit) {
            if (this.filled) this.filled = 0;
            if (this.spare) this.spare = 0;
            return;
        }
        // The card's parts one after another, never the card's own height, which is the min-height set here, and only its
        // own parts, never an element a theme adds to it. The list counts as its folds will end.
        const style = getComputedStyle(card);
        let content = px(style.borderTopWidth) + px(style.borderBottomWidth) + px(style.paddingTop) + px(style.paddingBottom);
        for (const part of card.querySelectorAll<HTMLElement>(CARD_PARTS)) {
            const partStyle = getComputedStyle(part);
            const height = part.classList.contains("list") ? listEndHeight(part, scale) : part.getBoundingClientRect().height / scale;
            content += px(partStyle.marginTop) + height + px(partStyle.marginBottom);
        }
        // The spare room as drawn now, which while a slide goes on is somewhere between the old and the new.
        const list = card.querySelector<HTMLElement>(":scope > .list, :scope > .message");
        content -= Math.max(0, list ? px(getComputedStyle(list).marginTop) : 0);
        const filled = filledHeight(content, this.config ?? {}, limit);
        const spare = spareRoom(filled, content);
        if (filled !== this.filled) {
            this.filled = filled;
        }
        if (spare !== this.spare) {
            this.spare = spare;
        }
    }

    /** The card's inline style: the height it is held to, or the rows it fills up to any limit, with their spare room above the list. */
    private cardStyle(): string {
        const style = filledStyle(this.config ?? {}, this.layout, this.minimumHeight(), this.filled);
        return this.filled ? `${style}; --wq-spare: ${this.spare}px` : style;
    }

    /** The card's classes: held to a height, its texts above the open section keep to one line, and a slide moves its rows along. */
    private cardClass(): string {
        return [this.heightStyle() && "held", this.sliding && "sliding", this.beside && "beside"].filter(Boolean).join(" ");
    }

    /** Whether the card is held to a height that is set, fixed or in rows, and so may have room left under its content. */
    private setHeight(): boolean {
        return this.heightStyle().startsWith("height");
    }

    protected shouldUpdate(changed: PropertyValues): boolean {
        if (!this.config || !changed.has("hass") || changed.size > 1) {
            return true;
        }
        const previous = changed.get("hass") as HomeAssistant | undefined;
        if (!previous || !this.hass) {
            return true;
        }
        if ((previous.locale?.language ?? previous.language) !== (this.hass.locale?.language ?? this.hass.language)) {
            return true;
        }
        // The registry can arrive after the states, and it tells which entities are WUD's and which is the queue.
        if (previous.entities !== this.hass.entities) {
            return true;
        }
        // Redraw when the queue has changed, when a WUD update entity has, or when one has come or gone.
        const queue = queueEntityId(this.hass);
        if (queue && previous.states[queue] !== this.hass.states[queue]) {
            return true;
        }
        const before = selectedEntities(previous, this.config);
        const after = selectedEntities(this.hass, this.config);
        return before.length !== after.length || after.some((id) => previous.states[id] !== this.hass?.states[id]);
    }

    /**
     * Brings what the card remembers of its installs up to date, and keeps a clock running while one is going.
     * An install is forgotten when its row is gone, which is also what happens when an even newer version
     * comes out, and a finished one after `DONE_KEEP`.
     */
    protected willUpdate(): void {
        this.projectList = this.projects();
        const units = new Map(this.projectList.flatMap((p) => p.units.map((u) => [u.key, u] as const)));
        // The first update to come in opens the waiting list, whichever section was open. Later ones leave it be.
        const pending = [...units.values()].some((u) => u.pending);
        if (this.hadPending === false && pending) {
            this.open = undefined;
        }
        this.hadPending = pending;
        const installs = new Map<string, Install>();
        this.followed = new Map();
        for (const [key, install] of this.installs) {
            const unit = units.get(key);
            if (!unit) {
                continue;
            }
            const followed = follow(unit, install, this.now);
            if (followed.status === "done" && this.now - (followed.install.ended ?? this.now) > DONE_KEEP) {
                continue;
            }
            installs.set(key, followed.install);
            this.followed.set(key, followed);
        }
        // Only a new Map is a change to the state, and the old one may be what an update is rendering.
        this.installs = installs;
        // With the WUD Queue integration, the queue tells how each row's install is going.
        const queue = this.hass && queueOf(this.hass);
        if (queue) {
            for (const [key, unit] of units) {
                const followed = followQueue(unit, queue);
                if (followed) {
                    this.followed.set(key, followed);
                }
            }
        }
        // The clock also runs while a finished row waits to be forgotten.
        const ticking = [...this.followed.values()].some((f) => f.status === "running" || f.status === "done");
        if (ticking && this.timer === undefined) {
            this.timer = window.setInterval(() => (this.now = Date.now()), 5000);
        } else if (!ticking && this.timer !== undefined) {
            window.clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.config) {
            return nothing;
        }
        const projects = this.projectList;
        const title = this.config.title ?? this.text("common.title");
        if (projects.length === 0) {
            return html`<ha-card style=${this.cardStyle()} class=${this.cardClass()}>
                <div class="hd"><div class="hd-title" title=${title}>${title}</div></div>
                <div class="message">${this.text("common.no_entities")}</div>
            </ha-card>`;
        }

        const followed = this.followed;
        const queue = queueOf(this.hass);
        const active = (unit: Unit) => unit.pending || unit.installing || followed.has(unit.key);
        const pendingProjects = projects.filter((p) => p.units.some(active));
        const currentProjects = projects.filter((p) => !p.units.some(active));
        const pendingUnits = pendingProjects.flatMap((p) => p.units).filter(active);
        const currentCount = currentProjects.reduce((n, p) => n + p.units.length, 0);
        // With updates waiting, one of the two sections is always open. Without, the up-to-date one opens and shuts.
        const open: Section | "none" = this.open === "current" ? "current" : pendingUnits.length > 0 ? "pending" : "none";
        // The queue takes installs at any time, except while it stops, while a call to it is on its way, or while its
        // sensor is away, as the integration starts. Without the integration, one install runs at a time.
        const busy =
            queueEntityId(this.hass) !== undefined
                ? !queue || queue.stopping || this.acting
                : pendingUnits.some((u) => running(u, followed));

        // Held to a set height with nothing waiting and nothing open, the room under the one line goes to a check.
        const idle = pendingUnits.length === 0 && open !== "current" && this.setHeight();

        return html`
            <ha-card style=${this.cardStyle()} class=${this.cardClass()}>
                <div class="hd">
                    ${pendingUnits.length === 0 ? html`<ha-icon class="hd-icon" icon="mdi:check-circle-outline"></ha-icon>` : nothing}
                    <div class="hd-title" title=${title}>${title}</div>
                    ${queue ? this.queueAction(queue, pendingUnits, followed) : nothing}
                </div>
                ${this.statusLine(pendingUnits, followed, queue)} ${queue && queue.items.length > 0 ? this.progress(queue) : nothing}
                <div class=${idle ? "list shut" : "list"}>
                    ${
                        pendingUnits.length === 0
                            ? nothing
                            : html`${
                                  currentCount === 0
                                      ? nothing
                                      : open === "pending"
                                        ? this.switchLine(this.text("common.pending_count", { n: pendingUnits.length }), "pending")
                                        : this.switchRow(
                                              this.text("common.pending_count", { n: pendingUnits.length }),
                                              "pending",
                                              this.sectionPill(pendingUnits, followed),
                                          )
                              }
                              ${this.fold(
                                  open === "pending",
                                  html`<div class="scroll pending">
                                      ${pendingProjects.map((p) => this.pendingProject(p, active, followed, busy))}
                                  </div>`,
                              )}`
                    }
                    ${
                        currentCount === 0
                            ? nothing
                            : html`${
                                  open === "current" && pendingUnits.length > 0
                                      ? this.switchLine(this.text("common.current_count", { n: currentCount }), "current")
                                      : this.switchRow(
                                            this.text("common.current_count", { n: currentCount }),
                                            open === "current" ? "none" : "current",
                                        )
                              }
                              ${this.fold(
                                  open === "current",
                                  html`<div class="scroll current">${currentProjects.map((p) => this.currentProject(p))}</div>`,
                              )}`
                    }
                </div>
                ${idle ? this.idle() : nothing}
            </ha-card>
        `;
    }

    /**
     * The room a card held to a set height has under its one shut line while nothing waits: a check, and lines on the
     * containers. How many containers and compose projects there are, per Docker host when there are several, the oldest
     * installed image by when it was built, and how many containers aren't running, when any. More lines than fit scroll.
     */
    private idle(): TemplateResult {
        const containers = this.projectList.flatMap((p) => p.units.flatMap((u) => u.containers));
        const watchers = [...new Set(containers.map((c) => c.watcher))].sort();
        const lines = watchers.map((watcher) => {
            const own = containers.filter((c) => c.watcher === watcher);
            const projects = new Set(own.filter((c) => c.stack).map((c) => c.stack)).size;
            const text = [
                watchers.length > 1 ? watcher : "",
                this.count("containers", own.length),
                projects > 0 ? this.count("projects", projects) : "",
            ]
                .filter(Boolean)
                .join(" · ");
            return { icon: "mdi:docker", text };
        });
        const oldest = containers
            .filter((c) => Date.parse(c.created) >= DOCKER_EPOCH)
            .sort((a, b) => Date.parse(a.created) - Date.parse(b.created))[0];
        if (oldest) {
            lines.push({
                icon: "mdi:clock-outline",
                text: this.text("common.oldest_image", { name: oldest.name, age: this.age(oldest.created) }),
            });
        }
        // WUD says only what Docker does, so anything but running counts, whatever Docker calls it.
        const stopped = containers.filter((c) => c.status && c.status !== "running").length;
        if (stopped > 0) {
            lines.push({ icon: "mdi:stop-circle-outline", text: this.count("not_running", stopped) });
        }
        return html`<div class="idle">
            <ha-icon class="idle-icon ${this.largeCheck ? "large" : ""}" icon="mdi:check-circle-outline"></ha-icon>
            <div class="idle-lines">
                ${lines.map(
                    ({ icon, text }) =>
                        html`<div class="idle-line"><ha-icon icon=${icon}></ha-icon><span title=${text}>${text}</span></div>`,
                )}
            </div>
        </div>`;
    }

    /** A count with its noun, which takes the singular for one. */
    private count(key: string, n: number): string {
        return this.text(`common.${key}${n === 1 ? "_one" : ""}`, { n });
    }

    /** How long ago a date was, in days, months or years, in the viewer's language. */
    private age(date: string): string {
        const days = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 86_400_000));
        const format = new Intl.RelativeTimeFormat(this.language(), { numeric: "auto" });
        if (days < 60) {
            return format.format(-days, "day");
        }
        return days < 730 ? format.format(-Math.round(days / 30.44), "month") : format.format(-Math.round(days / 365.25), "year");
    }

    /** One line under the title: what is going on, or what is waiting. */
    private statusLine(units: Unit[], followed: Map<string, Followed>, queue: Queue | undefined): TemplateResult {
        const line = (text: string) => html`<div class="hd-sub" title=${text}>${text}</div>`;
        const installing = units.filter((u) => running(u, followed));
        if (installing.length > 0) {
            return line(this.text("common.updating", { name: installing.map((u) => u.name).join(", ") }));
        }
        const failed = units.filter((u) => followed.get(u.key)?.status === "failed");
        if (failed.length > 0) {
            return line(this.text("common.failed", { name: failed.map((u) => u.name).join(", ") }));
        }
        if (queue?.state === "stopped") {
            return line(this.text("common.queue_stopped"));
        }
        // The section line below already counts the waiting updates.
        return line(this.text(units.some((u) => u.pending) ? "common.available" : "common.all_current"));
    }

    /** A project with something to install: its label when it has several rows, then the rows. */
    private pendingProject(
        project: Project,
        active: (unit: Unit) => boolean,
        followed: Map<string, Followed>,
        busy: boolean,
    ): TemplateResult {
        const rows = project.units.map((unit) => (active(unit) ? this.unitRow(unit, followed.get(unit.key), busy) : this.siblingRow(unit)));
        if (project.units.length === 1) {
            return html`${rows}`;
        }
        return html`<div class="proj">
            ${this.projectLabel(project, !project.units.some((u) => u.pending))}
            <div class="proj-body">${rows}</div>
        </div>`;
    }

    private currentProject(project: Project): TemplateResult {
        if (project.units.length === 1) {
            return this.siblingRow(project.units[0], false);
        }
        return html`<div class="proj">
            ${this.projectLabel(project, true)}
            <div class="proj-body">${project.units.map((unit) => this.siblingRow(unit))}</div>
        </div>`;
    }

    /** A compose project's own row, dimmed like its containers unless one of them has an update. */
    private projectLabel(project: Project, muted: boolean): TemplateResult {
        const services = project.units.reduce((n, u) => n + u.containers.length, 0);
        return html`<div class="row proj-head ${muted ? "muted" : ""}">
            <ha-icon class="ico" icon="mdi:layers-outline"></ha-icon>
            <div class="info">
                <div class="name">${project.name}<span class="count">${this.text("common.services", { n: services })}</span></div>
            </div>
        </div>`;
    }

    /** A row with an update, or one the card has installed since the page was opened. */
    private unitRow(unit: Unit, followed: Followed | undefined, busy: boolean): TemplateResult {
        const status = followed?.status ?? (unit.installing ? "running" : "pending");
        // A finished row shows the version it moved from; the first container that moved stands for all.
        const moved = followed?.install.from ?? {};
        const shown =
            status === "done"
                ? (unit.containers.find((c) => moved[c.entity_id] !== c.installed) ?? unit.containers[0])
                : (unit.containers.find((c) => c.pending) ?? unit.containers[0]);
        const from = status === "done" ? (moved[shown.entity_id] ?? "") : shown.installed;
        const to = status === "done" ? shown.installed : shown.latest;
        return html`
            <div class="row unit" role="button" tabindex="0" @click=${() => this.moreInfo(unit)} @keydown=${this.onKey(unit)}>
                ${this.statusIcon(status)}
                <div class="info">
                    <div class="name">${unit.name}${this.serviceCount(unit, followed)}</div>
                    <div class="sub ver">${from} → <span class="new">${to}</span></div>
                </div>
                <div class="end">
                    ${
                        // A failed row can be tried again. Its error stays under it until then.
                        status === "pending" || status === "failed" || status === "not_run"
                            ? html`<button
                                  class="install"
                                  ?disabled=${busy}
                                  title=${this.text("common.install", { name: unit.name })}
                                  aria-label=${this.text("common.install", { name: unit.name })}
                                  @click=${(event: Event) => this.install(event, unit)}
                              >
                                  <ha-icon icon="mdi:arrow-up"></ha-icon>
                              </button>`
                            : html`<span class="pill ${status}">${this.text(`status.${status}`)}</span>`
                    }
                </div>
            </div>
            ${
                status === "failed"
                    ? html`<div class="errline">
                          ${this.text(`error.${followed?.reason ?? "version"}`, {
                              version: shown.installed,
                              message: followed?.install.error ?? "",
                          })}
                      </div>`
                    : nothing
            }
        `;
    }

    /** An up-to-date row with its version: a thin line in a project's group, or a project of its own. */
    private siblingRow(unit: Unit, inGroup = true): TemplateResult {
        return html`<div
            class="row ${inGroup ? "sib" : ""} muted"
            role="button"
            tabindex="0"
            @click=${() => this.moreInfo(unit)}
            @keydown=${this.onKey(unit)}
        >
            <ha-icon class="ico" icon="mdi:docker"></ha-icon>
            <div class="info"><div class="name">${unit.name}${this.serviceCount(unit)}</div></div>
            <div class="end"><span class="ver">${unit.containers[0].installed}</span></div>
        </div>`;
    }

    private statusIcon(status: string): TemplateResult {
        const icons: Record<string, string> = {
            pending: "mdi:docker",
            queued: "mdi:timer-sand",
            not_run: "mdi:minus-circle-outline",
            running: "mdi:sync",
            done: "mdi:check",
            failed: "mdi:alert-circle-outline",
        };
        // A narrow card hides the row's pill, so the icon carries its text.
        const label = status === "pending" ? nothing : this.text(`status.${status}`);
        return html`<ha-icon class="ico ${status}" icon=${icons[status]} title=${label} aria-label=${label}></ha-icon>`;
    }

    /** "5 services", or "2/5 services" while they install. Nothing for a row of one container. */
    private serviceCount(unit: Unit, followed?: Followed): TemplateResult | typeof nothing {
        const n = unit.containers.length;
        if (n < 2) {
            return nothing;
        }
        const label =
            followed?.status === "running"
                ? this.text("common.services_done", { done: servicesDone(unit, followed.install), n })
                : this.text("common.services", { n });
        return html`<span class="count">${label}</span>`;
    }

    /** A section's line with the button that opens it, or shuts it when nothing else could be opened instead. */
    private switchRow(label: string, target: Section | "none", pill: TemplateResult | typeof nothing = nothing): TemplateResult {
        const section = target === "pending" ? "pending" : "current";
        return html`<button
            class="switch ${section}"
            aria-expanded=${target === "none" ? "true" : "false"}
            @click=${() => this.switchTo(target)}
        >
            <span class="switch-label"><span class="switch-text" title=${label}>${label}</span>${pill}</span>
            <span>${this.text(target === "none" ? "common.hide" : "common.show")}</span>
        </button>`;
    }

    /** The open section's line, which has nothing to switch to. */
    private switchLine(label: string, section: Section): TemplateResult {
        return html`<div class="switch ${section}"><span class="switch-text" title=${label}>${label}</span></div>`;
    }

    private switchTo(target: Section | "none"): void {
        this.open = target;
        this.sliding = true;
        window.clearTimeout(this.slideTimer);
        // The slide's end lifts it. Without a slide, as with reduced motion, there is no end to wait for.
        this.slideTimer = window.setTimeout(() => (this.sliding = false), 1000);
    }

    private readonly slid = (event: TransitionEvent): void => {
        if (event.propertyName !== "grid-template-rows" || event.target !== event.currentTarget) {
            return;
        }
        // The other section may still be sliding, as one reversed halfway ends before the one opening beside it.
        const moving = [...this.renderRoot.querySelectorAll(".fold")].some(
            (fold) => fold !== event.currentTarget && (fold.getAnimations?.().length ?? 0) > 0,
        );
        if (!moving) {
            window.clearTimeout(this.slideTimer);
            this.sliding = false;
        }
    };

    /** Content that slides open and shut. A shut one stays in the page, so the change can be animated. */
    private fold(isOpen: boolean, content: TemplateResult): TemplateResult {
        return html`<div class="fold ${isOpen ? "open" : ""}" ?inert=${!isOpen} @transitionend=${this.slid}>
            <div class="fold-in">${content}</div>
        </div>`;
    }

    /** On the closed row of waiting updates: whether something is installing or has failed. */
    private sectionPill(units: Unit[], followed: Map<string, Followed>): TemplateResult | typeof nothing {
        if (units.some((u) => running(u, followed))) {
            return html`<span class="pill running">${this.text("status.running")}</span>`;
        }
        if (units.some((u) => followed.get(u.key)?.status === "failed")) {
            return html`<span class="pill failed">${this.text("status.failed")}</span>`;
        }
        return nothing;
    }

    private async install(event: Event, unit: Unit): Promise<void> {
        // The button is its own thing to click; the row under it opens the entity.
        event.stopPropagation();
        if (!this.hass) {
            return;
        }
        const pending = unit.containers.filter((c) => c.pending);
        // With the integration the queue takes the row, and the card follows the queue. A refusal shows in Home
        // Assistant's own notice, as with the queue's buttons, and the row keeps showing what the queue says.
        if (queueEntityId(this.hass) !== undefined) {
            const installs = new Map(this.installs);
            installs.delete(unit.key);
            this.installs = installs;
            this.call("enqueue", { entity_id: pending.map((c) => c.entity_id) });
            return;
        }
        // Without it, the card sends the install itself and follows it. Services of one compose project can all be sent
        // at once, as WUD installs them one after another.
        const install: Install = {
            at: Date.now(),
            from: Object.fromEntries(unit.containers.map((c) => [c.entity_id, c.installed])),
            targets: Object.fromEntries(unit.containers.map((c) => [c.entity_id, c.pending ? c.latest : c.installed])),
            started: false,
        };
        this.installs = new Map(this.installs).set(unit.key, install);
        this.now = Date.now();
        try {
            await this.hass.callService("update", "install", {}, { entity_id: pending.map((c) => c.entity_id) });
        } catch (error) {
            // Home Assistant refused it, so WUD never got it. Say why on the row.
            const message = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error);
            this.installs = new Map(this.installs).set(unit.key, { ...install, error: message });
        }
    }

    /** Opens a row's entity from the keyboard, as a click does. */
    private onKey(unit: Unit): (event: KeyboardEvent) => void {
        return (event) => {
            if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                this.moreInfo(unit);
            }
        };
    }

    /** The queue's one button: update everything waiting, stop the run, try again after a failure, or clear a finished run. */
    private queueAction(queue: Queue, units: Unit[], followed: Map<string, Followed>): TemplateResult | typeof nothing {
        if (queue.state === "running") {
            return this.actionButton(this.text(queue.stopping ? "common.stopping" : "common.stop"), "mdi:stop", queue.stopping, () =>
                this.call("stop"),
            );
        }
        // A failed run whose containers have all got their updates some other way has nothing to try again, only to put away.
        if (queue.state === "failed") {
            return this.hass && retryable(this.hass, queue)
                ? this.actionButton(this.text("common.retry"), "mdi:refresh", false, () => this.call("retry"))
                : this.actionButton(this.text("common.clear"), "mdi:check", false, () => this.call("clear"));
        }
        const waiting = units
            .filter((u) => u.pending && !["queued", "running"].includes(followed.get(u.key)?.status ?? ""))
            .flatMap((u) => u.containers.filter((c) => c.pending).map((c) => c.entity_id));
        if (waiting.length > 0) {
            return this.actionButton(this.text("common.update_all"), "mdi:update", false, () =>
                this.call("enqueue", { entity_id: waiting }),
            );
        }
        // Nothing to do but finished rows on show: they can be put away before the queue does it by itself.
        if (queue.items.some((i) => i.status === "done")) {
            return this.actionButton(this.text("common.clear"), "mdi:check", false, () => this.call("clear"));
        }
        return nothing;
    }

    /** The text of a wide card, or a round icon on a narrow one, with the text as its tooltip and label. */
    private actionButton(label: string, icon: string, disabled: boolean, action: () => void): TemplateResult {
        return html`<button class="action" title=${label} aria-label=${label} ?disabled=${disabled || this.acting} @click=${action}>
            <ha-icon icon=${icon}></ha-icon><span>${label}</span>
        </button>`;
    }

    private call(service: string, data: Record<string, unknown> = {}): void {
        if (!this.hass) {
            return;
        }
        this.acting = true;
        // A refused call shows in Home Assistant's own notice. The queue's state is unchanged, and so is the card.
        void this.hass
            .callService("wud_queue", service, data)
            .catch(() => undefined)
            .finally(() => (this.acting = false));
    }

    /** A thin bar with a segment per item of the queue, coloured by how it went. */
    private progress(queue: Queue): TemplateResult {
        return html`<div class="bar" role="presentation">
            ${queue.items.map((item) => html`<span class="seg ${item.status}" title=${item.name}></span>`)}
        </div>`;
    }

    private moreInfo(unit: Unit): void {
        this.dispatchEvent(
            new CustomEvent("hass-more-info", {
                detail: { entityId: unit.containers[0].entity_id },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private projects(): Project[] {
        if (!this.hass || !this.config) {
            return [];
        }
        const hass = this.hass;
        const ids = selectedEntities(hass, this.config);
        // While WUD recreates a container, its entity is briefly without a usable state. A container being installed
        // keeps its last known row meanwhile, so the row and its install aren't lost. One that is really gone has no
        // entity at all.
        const installing = new Set([
            ...[...this.installs.values()].flatMap((install) => Object.keys(install.targets)),
            ...(queueOf(hass)?.items ?? []).flatMap((item) => item.entities.map((e) => e.entity_id)),
        ]);
        for (const id of installing) {
            if (!ids.includes(id) && this.known.has(id) && hass.states[id] !== undefined) {
                ids.push(id);
            }
        }
        const containers = ids
            .map((id) => {
                const state = hass.states[id];
                const container = state && isWud(state) ? containerOf(state) : undefined;
                if (container) {
                    this.known.set(id, container);
                }
                return container ?? this.known.get(id);
            })
            .filter((c): c is Container => c !== undefined);
        // A container whose entity is gone altogether is forgotten.
        for (const id of this.known.keys()) {
            if (hass.states[id] === undefined) {
                this.known.delete(id);
            }
        }
        return projectsOf(containers);
    }

    private text(key: string, values: Record<string, string | number> = {}): string {
        return translate(this.language(), key).replace(/\{(\w+)\}/g, (match, name: string) =>
            name in values ? String(values[name]) : match,
        );
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }

    static get styles(): CSSResultGroup {
        return [
            css`
                /*
             * A column, so that with a height of its own, given in the options or by the dashboard's grid, the
             * title and the section lines keep their place and the open section scrolls in what is left.
             */
                ha-card {
                    /* ha-card's own transition covers every property, so a change in the rows filled would animate. Only a slide does. */
                    transition: none;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    container-type: inline-size;
                    --wq-soft: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
                    --wq-track: rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.08);
                }

                .hd {
                    flex: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 12px 0 16px;
                }

                /* The card's one call to action, so it looks like one on any theme. */
                .action {
                    flex: none;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                    --mdc-icon-size: 18px;
                    font: inherit;
                    font-size: 12.5px;
                    font-weight: 500;
                    color: var(--text-primary-color, #fff);
                    background: var(--primary-color);
                    border: 0;
                    border-radius: 16px;
                    padding: 5px 12px;
                    cursor: pointer;
                }

                .action ha-icon {
                    display: none;
                }

                .action:disabled {
                    opacity: 0.5;
                    cursor: default;
                }

                .action:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }

                .bar {
                    flex: none;
                    display: flex;
                    gap: 3px;
                    margin: 8px 16px 0;
                }

                /* Waiting and not run: a grey that shows on light and dark themes alike. */
                .seg {
                    flex: 1 1 0;
                    height: 4px;
                    border-radius: 2px;
                    background: color-mix(in srgb, var(--secondary-text-color) 35%, transparent);
                }

                .seg.running {
                    background: var(--primary-color);
                    opacity: 0.6;
                }

                .seg.done {
                    background: var(--success-color, #43a047);
                }

                .seg.failed {
                    background: var(--error-color, #db4437);
                }

                /* A check before the title while nothing waits, as in updates-card. */
                .hd-icon {
                    flex: none;
                    color: var(--success-color, #43a047);
                }

                .hd-title {
                    flex: 1 1 auto;
                    min-width: 0;
                    font-size: var(--ha-card-header-font-size, 18px);
                    line-height: 1.4;
                }

                /* The status line reads the same in every state, in the text colour. The rows show the colours. */
                .hd-sub {
                    flex: none;
                    padding: 0 16px;
                    font-size: 12px;
                    color: var(--primary-text-color);
                }

                /* Under the check, the status line starts where the title does: the header's padding, the icon and the gap. */
                .hd:has(.hd-icon) + .hd-sub {
                    padding-left: 50px;
                }

                .message {
                    margin-top: var(--wq-spare, 0px);
                    padding: 4px 16px 14px;
                    font-size: 12px;
                    color: var(--secondary-text-color);
                }

                /* The room a whole row leaves over goes above the list, under the status line or the progress bar. */
                .list {
                    flex: 1 1 auto;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    margin-top: var(--wq-spare, 0px);
                    padding-top: 6px;
                }

                .list > * {
                    flex: none;
                }

                .list > .fold.open {
                    flex: 1 1 auto;
                    min-height: 0;
                }

                .scroll {
                    height: 100%;
                    box-sizing: border-box;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    padding-bottom: 4px;
                }

                .sliding .scroll {
                    overflow-y: hidden;
                }

                .row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 3px 12px 3px 16px;
                    min-height: 40px;
                    cursor: pointer;
                }

                .ico {
                    flex: 0 0 28px;
                    --mdc-icon-size: 20px;
                    display: flex;
                    justify-content: center;
                    color: var(--secondary-text-color);
                }

                .ico.running {
                    color: var(--primary-color);
                    animation: spin 1.4s linear infinite;
                }

                .ico.done {
                    color: var(--success-color, #43a047);
                }

                .ico.failed {
                    color: var(--error-color, #db4437);
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .info {
                    flex: 1 1 auto;
                    min-width: 0;
                }

                /* Names and versions wrap rather than being cut, digests and long build tags included. */
                .name,
                .sub,
                .ver {
                    line-height: 1.3;
                    overflow-wrap: anywhere;
                }

                .name {
                    font-size: 14px;
                }

                .sub {
                    font-size: 11.5px;
                    color: var(--secondary-text-color);
                }

                .ver {
                    font-family: var(--ha-font-family-code, ui-monospace, monospace);
                    font-size: 11.5px;
                }

                .ver .new {
                    color: var(--primary-color);
                    font-weight: 500;
                }

                /* Never squeezed below its pill or button. A long version wraps within its half of the row instead. */
                .end {
                    flex: none;
                    max-width: 50%;
                    text-align: right;
                    display: flex;
                    align-items: center;
                    color: var(--secondary-text-color);
                }

                .muted {
                    opacity: 0.62;
                }

                .count {
                    font-size: 11px;
                    color: var(--secondary-text-color);
                    background: var(--wq-track);
                    border-radius: 8px;
                    padding: 0 6px;
                    margin-left: 6px;
                    vertical-align: 1px;
                    white-space: nowrap;
                }

                .install {
                    flex: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 0;
                    padding: 0;
                    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
                    color: var(--primary-text-color);
                    display: grid;
                    place-items: center;
                    cursor: pointer;
                    --mdc-icon-size: 17px;
                }

                .install:disabled {
                    opacity: 0.35;
                    cursor: default;
                }

                /* Inside its edges, so the scrolling section doesn't clip it at the card's sides. */
                .row:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: -2px;
                }

                .install:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }

                /* Inside the line, as the card clips what is drawn outside it and the line is as wide as the card. */
                .switch:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: -2px;
                }

                .pill {
                    font-size: 11px;
                    font-weight: 500;
                    border-radius: 10px;
                    padding: 1px 8px;
                    white-space: nowrap;
                }

                .pill.running {
                    background: var(--wq-soft);
                    color: var(--primary-color);
                }

                .pill.queued,
                .pill.not_run {
                    background: var(--wq-track);
                    color: var(--secondary-text-color);
                }

                .pill.done {
                    background: rgba(var(--rgb-success-color, 67, 160, 71), 0.12);
                    color: var(--success-color, #43a047);
                }

                .pill.failed {
                    background: rgba(var(--rgb-error-color, 219, 68, 55), 0.1);
                    color: var(--error-color, #db4437);
                }

                .errline {
                    margin: 0 12px 6px 54px;
                    padding: 6px 9px;
                    border-radius: 8px;
                    font-size: 12px;
                    color: var(--error-color, #db4437);
                    background: rgba(var(--rgb-error-color, 219, 68, 55), 0.1);
                }

                /* A compose project with several rows: a small label, then its rows along a guide line. */
                .proj {
                    margin-top: 2px;
                }

                .row.proj-head {
                    min-height: 30px;
                    cursor: default;
                }

                .proj-body {
                    margin-left: 29px;
                    border-left: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
                }

                .proj-body .row {
                    padding-left: 10px;
                }

                .proj-body .errline {
                    margin-left: 48px;
                }

                .row.sib,
                .current .row,
                .current .row.proj-head {
                    min-height: 26px;
                    padding-top: 1px;
                    padding-bottom: 1px;
                }

                /* A thin row that can't fit its name and version side by side puts the version under the name. */
                .row.sib,
                .current .row:not(.proj-head) {
                    flex-wrap: wrap;
                    row-gap: 0;
                }

                .row.sib .info,
                .current .row .info {
                    flex: 1 0 auto;
                    max-width: 100%;
                }

                .row.sib .end,
                .current .row .end {
                    margin-left: auto;
                    max-width: 100%;
                }

                .row.sib .ico,
                .current .ico {
                    --mdc-icon-size: 16px;
                }

                .row.sib .name,
                .current .name {
                    font-size: 13px;
                }

                .fold {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows var(--ha-animation-duration-normal, 250ms) ease;
                }

                .fold.open {
                    grid-template-rows: 1fr;
                }

                .fold-in {
                    min-height: 0;
                    overflow: hidden;
                }

                .switch {
                    box-sizing: border-box;
                    width: 100%;
                    font: inherit;
                    font-size: 12.5px;
                    color: var(--secondary-text-color);
                    background: none;
                    border: 0;
                    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
                    padding: 9px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    text-align: left;
                }

                /* A narrow card gives the rows the room its indents would take. */
                @container (max-width: 300px) {
                    .hd,
                    .row {
                        padding-left: 10px;
                        gap: 8px;
                    }

                    .hd-sub,
                    .message,
                    .switch {
                        padding-left: 10px;
                        padding-right: 10px;
                    }

                    .hd:has(.hd-icon) + .hd-sub {
                        padding-left: 42px;
                    }

                    .proj-body {
                        margin-left: 22px;
                    }

                    .proj-body .row {
                        padding-left: 6px;
                    }

                    .errline,
                    .proj-body .errline {
                        margin-left: 10px;
                    }

                    /* A waiting row's versions take a line of their own across the row, under its icon too. */
                    .row.unit {
                        display: grid;
                        grid-template-columns: 28px minmax(0, 1fr) auto;
                        row-gap: 2px;
                    }

                    .row.unit .info {
                        display: contents;
                    }

                    .row.unit .name {
                        grid-column: 2;
                    }

                    .row.unit .sub {
                        grid-column: 1 / -1;
                        grid-row: 2;
                    }

                    /* A row's pill would take half of it, so its icon says the same instead. */
                    .row .end:has(> .pill) {
                        display: none;
                    }

                    .action {
                        width: 32px;
                        height: 32px;
                        padding: 0;
                        border-radius: 50%;
                        justify-content: center;
                    }

                    .action ha-icon {
                        display: inline-flex;
                    }

                    .action span {
                        display: none;
                    }
                }

                button.switch {
                    cursor: pointer;
                }

                .switch-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                }

                /* Held to a height, the texts above the open section keep to one line, cut short with their text as a tooltip. */
                .held .hd-title,
                .held .hd-sub,
                .held .switch-text {
                    min-width: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .held .switch-label .pill {
                    flex: none;
                }

                /* Held, the open section scrolls, so its scrollbar and, as the card's last part, its end keep off the card's edges. */
                .held .list > .fold.open {
                    margin-right: 4px;
                }

                .held .list > .fold.open:last-child {
                    margin-bottom: 8px;
                }

                /* Its rows are measured the same whether it scrolls or not. */
                .held .scroll {
                    scrollbar-gutter: stable;
                }

                .held .list > .fold.open:last-child .scroll {
                    padding-bottom: 0;
                }

                /* Held and shut, the room under the line goes to the check and its lines instead of the list. */
                .held .list.shut {
                    flex: none;
                }

                /* With more lines than fit, it scrolls from its top. The lists are shut, so it is the card's only scroller. */
                .idle {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: safe center;
                    gap: 4px;
                    margin-right: 4px;
                    padding: 0 12px 12px 16px;
                    color: var(--secondary-text-color);
                }

                .idle-icon {
                    --mdc-icon-size: 64px;
                    flex: none;
                    margin-bottom: 4px;
                    color: var(--success-color, #43a047);
                    opacity: 0.5;
                }

                /* When the room fits it with its lines. Its size and the room under it add up to LARGE_CHECK_PX. */
                .idle-icon.large {
                    --mdc-icon-size: 100px;
                    margin-bottom: 20px;
                }

                /* Each line is centred on its own, under the check. */
                .idle-lines {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    min-width: 0;
                    max-width: 100%;
                }

                /* A line wraps rather than cut short, as the room scrolls when they don't fit, its icon centred on its text. */
                .idle-line {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    max-width: 100%;
                    font-size: 12px;
                    line-height: 16px;
                    --mdc-icon-size: 16px;
                }

                .idle-line ha-icon {
                    flex: none;
                }

                .idle-line span {
                    min-width: 0;
                    overflow-wrap: anywhere;
                }

                /* The rows the card fills, and the spare room above the list, change along with a slide, not on ha-card's own timing. */
                ha-card.sliding {
                    transition: min-height var(--ha-animation-duration-normal, 250ms) ease;
                }

                ha-card.sliding > .list {
                    transition: margin var(--ha-animation-duration-normal, 250ms) ease;
                }

                /*
                 * A waiting row's versions go beside its name, next to the button, when every waiting row's fit there, as
                 * measured, on one line. Its name wraps between words only, as its longest word was measured to fit. A narrow
                 * card keeps its own layout.
                 */
                @container (width > 300px) {
                    .beside .row.unit > .info {
                        display: flex;
                        align-items: baseline;
                        justify-content: space-between;
                        gap: 16px;
                    }

                    .beside .row.unit > .info > .name {
                        overflow-wrap: break-word;
                    }

                    .beside .row.unit > .info > .ver {
                        flex: none;
                        white-space: nowrap;
                        text-align: end;
                    }

                    /* Up-to-date siblings line their version up with the waiting rows', left of the buttons. */
                    .beside .pending .row.sib .end {
                        margin-right: 40px;
                    }

                    /* Measuring: each name at its longest word, never broken inside one, beside its whole version. */
                    .measuring .row.unit > .info > .name {
                        flex: none;
                        width: min-content;
                        overflow-wrap: normal;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ico.running {
                        animation: none;
                    }

                    .fold,
                    ha-card.sliding,
                    ha-card.sliding > .list {
                        transition: none;
                    }
                }
            `,
            fadeStyles,
        ];
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "wud-queue-card": WudQueueCard;
    }
}
