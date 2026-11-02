import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../src/wud-queue-card";
import { listEndHeight } from "../src/wud-queue-card";
import type { WudQueueCard } from "../src/wud-queue-card";
import type { HassEntity, HomeAssistant } from "../src/hass";
import type { WudQueueCardConfig } from "../src/types";
import { entity, hass, sample } from "./fixtures";

async function card(state: HomeAssistant, config: Partial<WudQueueCardConfig> = {}, layout?: string): Promise<WudQueueCard> {
    const element = document.createElement("wud-queue-card") as WudQueueCard;
    element.layout = layout;
    element.setConfig({ type: "custom:wud-queue-card", ...config });
    element.hass = state;
    document.body.append(element);
    await element.updateComplete;
    return element;
}

function one(element: WudQueueCard, selector: string): HTMLElement | null {
    return element.shadowRoot!.querySelector<HTMLElement>(selector);
}

function all(element: WudQueueCard, selector: string): HTMLElement[] {
    return [...element.shadowRoot!.querySelectorAll<HTMLElement>(selector)];
}

const text = (element: Element) => element.textContent?.replace(/\s+/g, " ").trim() ?? "";

/** Containers that are all up to date: two compose projects on one Docker host and one container without compose. */
function quiet(extra: HassEntity[] = []): HassEntity[] {
    return [
        entity("update.web_a", {
            stack: "web",
            service: "site_a",
            image: "library/node",
            installed: "26.2.0",
            created: "2026-10-30T08:00:00Z",
        }),
        entity("update.web_b", {
            stack: "web",
            service: "site_b",
            image: "library/node",
            installed: "26.2.0",
            created: "2026-10-30T08:00:00Z",
        }),
        entity("update.media_db", {
            stack: "media",
            service: "db",
            image: "library/mariadb",
            installed: "11.4.2",
            created: "2026-01-02T00:00:00Z",
        }),
        entity("update.cache", { image: "library/redis", installed: "8.0.1", name: "cache", service: "cache" }),
        ...extra,
    ];
}

beforeEach(() => {
    document.body.innerHTML = "";
});

afterEach(() => {
    vi.useRealTimers();
});

// happy-dom lays nothing out, so each element is given the box it would have.
interface Box {
    top?: number;
    height: number;
    style?: string;
    className?: string;
    children?: Box[];
}

function build(box: Box): HTMLElement {
    const element = document.createElement("div");
    element.className = box.className ?? "";
    element.style.cssText = box.style ?? "";
    const top = box.top ?? 0;
    element.getBoundingClientRect = () => ({ top, bottom: top + box.height, height: box.height }) as DOMRect;
    for (const child of box.children ?? []) {
        element.append(build(child));
    }
    return element;
}

/** A section's fold, `now` pixels of it showing, around a scroller at `top` holding the given rows. */
function fold(open: boolean, now: number, top: number, rows: Box[], scrollStyle = "padding-bottom: 4px"): Box {
    return {
        className: open ? "fold open" : "fold",
        height: now,
        children: [
            {
                className: "fold-in",
                height: now,
                children: [{ className: "scroll", top, height: now, style: scrollStyle, children: rows }],
            },
        ],
    };
}

describe("the height the list ends at once its sections have slid", () => {
    const rows = [
        { top: 100, height: 40 },
        { top: 140, height: 40, style: "margin-bottom: 2px" },
    ];

    it.each([
        ["a section line and a shut section end at the line", [{ height: 34 }, fold(false, 30, 100, rows)], 40],
        [
            "an open section ends at its last row, its margin and the scroller's padding, not the part showing",
            [{ height: 34 }, fold(true, 10, 100, rows)],
            126,
        ],
        [
            "one section opening and the other shutting count only the open one",
            [{ height: 34 }, fold(true, 10, 100, rows), { height: 34 }, fold(false, 50, 0, rows)],
            160,
        ],
        ["a section without rows ends at nothing", [{ height: 34 }, fold(true, 10, 100, [])], 40],
    ])("%s", (_name, children, height) => {
        const list = build({ style: "padding-top: 6px", height: 0, children });
        document.body.append(list);
        expect(listEndHeight(list)).toBe(height);
    });
});

describe("filling the rows of a sections view", () => {
    /** The card's parts given their boxes, rows filled, and the card's style returned. */
    async function filled(element: WudQueueCard, theme = false): Promise<string> {
        const haCard = one(element, "ha-card")!;
        const box = (target: Element, height: number) =>
            (target.getBoundingClientRect = () => ({ top: 0, bottom: height, height, width: 300 }) as DOMRect);
        Object.defineProperty(haCard, "clientWidth", { value: 300, configurable: true });
        box(haCard, 56);
        box(one(element, ".hd")!, 41);
        box(one(element, ".hd-sub")!, 17);
        box(one(element, ".switch")!, 22);
        if (theme) {
            const added = document.createElement("div");
            box(added, 500);
            haCard.append(added);
        }
        (element as unknown as { fillRows(): void }).fillRows();
        await element.updateComplete;
        return haCard.getAttribute("style") ?? "";
    }

    it.each([
        ["whole rows, with the spare room above the list", {}, "min-height: 120px; --wq-spare: 34px"],
        ["half rows", { row_step: "half" as const }, "min-height: 88px; --wq-spare: 2px"],
    ])("on automatic rows, ends on %s", async (_name, config, style) => {
        const element = await card(hass(quiet()), config, "grid");
        expect(await filled(element)).toBe(style);
    });

    it("measures only its own parts, never an element a theme adds to it", async () => {
        const element = await card(hass(quiet()), {}, "grid");
        expect(await filled(element, true)).toBe("min-height: 120px; --wq-spare: 34px");
    });

    it.each([
        ["outside a sections view", {}, undefined, ""],
        ["held to a height", { height: 300 }, "grid", "height: 300px"],
        ["held up to a limit", { max_height: 300 }, "grid", "max-height: 300px"],
        ["on rows set in the layout tab", { grid_options: { rows: 5 } }, "grid", "height: 100%"],
    ])("leaves its rows alone %s", async (_name, config, layout, style) => {
        const element = await card(hass(quiet()), config as Partial<WudQueueCardConfig>, layout);
        expect(await filled(element)).toBe(style);
    });

    it("puts the spare room above the list, under the progress bar while the queue has one", async () => {
        const state = hass(quiet());
        const id = "sensor.wud_queue";
        const item = { name: "db", status: "done", reason: null, error: null, entities: [] };
        const element = await card(
            {
                ...state,
                states: {
                    ...state.states,
                    [id]: {
                        entity_id: id,
                        state: "idle",
                        last_changed: "2026-10-13T08:00:00Z",
                        attributes: { items: [item], stopping: false },
                    },
                },
                entities: { ...state.entities, [id]: { entity_id: id, platform: "wud_queue" } },
            },
            {},
            "grid",
        );
        const haCard = one(element, "ha-card")!;
        expect([...haCard.children].map((child) => child.classList[0])).toEqual(["hd", "hd-sub", "bar", "list"]);
        const bar = one(element, ".bar")!;
        bar.getBoundingClientRect = () => ({ top: 0, bottom: 12, height: 12, width: 300 }) as DOMRect;
        expect(await filled(element)).toBe("min-height: 120px; --wq-spare: 14px");
    });

    it("lets a change of layout through to an update, past the filter on Home Assistant's changes", async () => {
        const element = await card(hass(quiet()));
        const update = element as unknown as { shouldUpdate(changed: Map<string, unknown>): boolean };
        expect(update.shouldUpdate(new Map<string, unknown>([["hass", element.hass]]))).toBe(false);
        expect(
            update.shouldUpdate(
                new Map<string, unknown>([
                    ["hass", element.hass],
                    ["layout", undefined],
                ]),
            ),
        ).toBe(true);
    });
});

describe("the least height", () => {
    // The header, status line, progress bar, both section lines, their padding and the border are 150 px. The first waiting
    // row with its project's name is 126 px from 214 px up, and more below, on a card narrower than its columns allow.
    it.each([
        ["before it is measured", 0, 5, 276],
        ["measured wide", 600, 5, 276],
        ["measured at 214 px", 214, 5, 276],
        ["measured at 213 px", 213, 5, 284],
        ["measured at 180 px", 180, 5, 284],
        ["measured at 179 px", 179, 5, 302],
        ["measured at 160 px", 160, 5, 302],
        ["measured at 150 px", 150, 6, 372],
        ["measured at 149 px", 149, 8, 463],
    ])("%s", async (_name, width, rows, height) => {
        const element = await card(hass(), { height: 100 });
        (element as unknown as { width: number }).width = width;
        await element.updateComplete;
        expect(element.getGridOptions()).toMatchObject({ min_columns: 9, min_rows: rows });
        expect(one(element, "ha-card")!.getAttribute("style")).toBe(`height: ${height}px`);
    });

    it.each([
        ["raises a limit below it to it", { max_height: 100 }, 0, "max-height: 276px", 6],
        [
            "raises a limit below it to it on a narrow card, where the content still decides its size",
            { max_height: 100 },
            149,
            "max-height: 463px",
            6,
        ],
        ["leaves a set height above it as it is", { height: 400 }, 600, "height: 400px", 8],
        ["raises a set height above the wide card's least to the narrow card's", { height: 400 }, 149, "height: 463px", 9],
        ["counts itself in the masonry view's card sizes by its least height", { height: 100 }, 0, "height: 276px", 6],
    ])("%s", async (_name, config, width, style, size) => {
        const element = await card(hass(), config);
        (element as unknown as { width: number }).width = width;
        await element.updateComplete;
        expect(one(element, "ha-card")!.getAttribute("style")).toBe(style);
        expect(element.getCardSize()).toBe(size);
    });
});

describe("held to a height", () => {
    it("keeps the title, the status line and the section lines to one line, with their text as a tooltip", async () => {
        const element = await card(hass(), { height: 300 });
        expect(one(element, "ha-card")!.classList.contains("held")).toBe(true);
        for (const selector of [".hd-title", ".hd-sub", ".switch-text"]) {
            for (const part of all(element, selector)) {
                expect(part.getAttribute("title")).toBe(text(part));
            }
        }
        expect(all(element, ".switch-text").map(text)).toEqual(["4 odottaa päivitystä", "1 ajan tasalla"]);
    });

    it("isn't held when it fits its content", async () => {
        const element = await card(hass());
        expect(one(element, "ha-card")!.classList.contains("held")).toBe(false);
    });
});

describe("the room under the one line while nothing waits", () => {
    // Only a height that is set leaves room. One that fits the content, or grows up to a limit, has none.
    it.each([
        ["fitting its content", {}, undefined, false, false, false],
        ["growing up to a limit", { max_height: 300 }, undefined, false, false, false],
        ["at a fixed height", { height: 300 }, undefined, false, false, true],
        ["at a fixed height, the up-to-date list open", { height: 300 }, undefined, true, false, false],
        ["at a fixed height, with an update waiting", { height: 300 }, undefined, false, true, false],
        ["on rows set in the layout tab", { grid_options: { rows: 5 } }, "grid", false, false, true],
        ["on automatic rows, at a fixed height", { height: 300, grid_options: { rows: "auto" } }, "grid", false, false, true],
        ["on automatic rows, fitting its content", { grid_options: { rows: "auto" } }, "grid", false, false, false],
    ])("shows a check %s only when held to a set height", async (_name, config, layout, open, waiting, idle) => {
        const extra = waiting ? [entity("update.app", { image: "example/app", installed: "1.0.0", latest: "1.1.0", service: "app" })] : [];
        const element = await card(hass(quiet(extra)), config as Partial<WudQueueCardConfig>, layout);
        if (open) {
            one(element, "button.switch")!.click();
            await element.updateComplete;
        }
        expect(one(element, ".idle") !== null).toBe(idle);
        expect(one(element, ".idle-icon") !== null).toBe(idle);
        expect(one(element, ".list")!.classList.contains("shut")).toBe(idle);
    });

    const NOW = Date.parse("2026-11-02T12:00:00Z");
    const ago = (days: number) => new Date(NOW - days * 86_400_000).toISOString();
    /** A container without compose, up to date, with its image built `created`. */
    const solo = (name: string, created?: string, extra: { status?: string; watcher?: string; stack?: string } = {}) =>
        entity(`update.${name}`, { image: `example/${name}`, installed: "1.0.0", name, service: name, created, ...extra });

    it.each([
        [
            "counts the containers and compose projects, names the oldest image, and counts those not running",
            "fi",
            quiet([solo("proxy", undefined, { status: "exited" })]),
            ["5 konttia · 2 compose-projektia", "Vanhin image: db, tehty 10 kuukautta sitten", "1 kontti ei käynnissä"],
        ],
        [
            "gives each Docker host a line of its own, leaving out the projects of a host without compose",
            "fi",
            [solo("app", undefined, { stack: "web" }), solo("nas_app", undefined, { watcher: "nas" })],
            ["local · 1 kontti · 1 compose-projekti", "nas · 1 kontti"],
        ],
        ["leaves out the image line without dates", "fi", [solo("cache")], ["1 kontti"]],
        [
            "skips a date that can't be read",
            "fi",
            [solo("a", "not a date"), solo("b", ago(10))],
            ["2 konttia", "Vanhin image: b, tehty 10 päivää sitten"],
        ],
        [
            "skips a reproducible build's placeholder dates, which are older than Docker",
            "fi",
            [solo("a", "1970-01-01T00:00:00Z"), solo("b", "0001-01-01T00:00:00Z"), solo("c", ago(3))],
            ["3 konttia", "Vanhin image: c, tehty 3 päivää sitten"],
        ],
        [
            "counts an image from 2013 on, and skips one dated before",
            "fi",
            [solo("a", "2012-12-31T23:59:59Z"), solo("b", "2013-01-01T00:00:00Z")],
            ["2 konttia", "Vanhin image: b, tehty 14 vuotta sitten"],
        ],
        ["leaves out the image line when every date is a placeholder", "fi", [solo("a", "1970-01-01T00:00:00Z")], ["1 kontti"]],
        ["tells an image built today", "fi", [solo("a", ago(0))], ["1 kontti", "Vanhin image: a, tehty tänään"]],
        ["tells an image built yesterday", "fi", [solo("a", ago(1))], ["1 kontti", "Vanhin image: a, tehty eilen"]],
        ["tells an image's age in days below 60", "fi", [solo("a", ago(59))], ["1 kontti", "Vanhin image: a, tehty 59 päivää sitten"]],
        [
            "tells an image's age in months from 60 days",
            "fi",
            [solo("a", ago(60))],
            ["1 kontti", "Vanhin image: a, tehty 2 kuukautta sitten"],
        ],
        [
            "tells an image's age in months below two years",
            "fi",
            [solo("a", ago(729))],
            ["1 kontti", "Vanhin image: a, tehty 24 kuukautta sitten"],
        ],
        [
            "tells an image's age in years from two years",
            "fi",
            [solo("a", ago(730))],
            ["1 kontti", "Vanhin image: a, tehty 2 vuotta sitten"],
        ],
        ["rounds an image's years", "fi", [solo("a", ago(1000))], ["1 kontti", "Vanhin image: a, tehty 3 vuotta sitten"]],
        [
            "counts every container that isn't running, whatever Docker calls it, but not one without a state",
            "fi",
            [
                solo("a", undefined, { status: "exited" }),
                solo("b", undefined, { status: "paused" }),
                solo("c"),
                solo("d", undefined, { status: "running" }),
            ],
            ["4 konttia", "2 konttia ei käynnissä"],
        ],
        [
            "speaks English in the singular",
            "en",
            [solo("a", ago(1), { stack: "web" })],
            ["1 container · 1 compose project", "Oldest image: a, built yesterday"],
        ],
        [
            "speaks English",
            "en",
            quiet([solo("proxy", undefined, { status: "exited" })]),
            ["5 containers · 2 compose projects", "Oldest image: db, built 10 months ago", "1 container not running"],
        ],
    ])("%s", async (_name, language, list, expected) => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date(NOW));
        const element = await card({ ...hass(list), locale: { language } }, { height: 300 });
        expect(all(element, ".idle-line").map(text)).toEqual(expected);
        expect(all(element, ".idle-line span").map((span) => span.getAttribute("title"))).toEqual(expected);
    });
});

describe("what a narrow card says without words", () => {
    it("gives a row's status icon its pill's text, and a waiting row's icon none", async () => {
        const list = [
            ...sample(),
            entity("update.tool", {
                image: "example/tool",
                installed: "1.0.0",
                latest: "1.1.0",
                service: "tool",
                name: "tool",
                installing: true,
            }),
        ];
        const element = await card(hass(list));
        const icon = (name: string) =>
            all(element, ".scroll.pending .row.unit")
                .find((row) => row.querySelector(".name")?.textContent?.trim().startsWith(name))
                ?.querySelector(".ico");
        expect(icon("tool")?.getAttribute("title")).toBe("Päivitetään");
        expect(icon("tool")?.getAttribute("aria-label")).toBe("Päivitetään");
        expect(icon("player")?.hasAttribute("title")).toBe(false);
        expect(icon("player")?.hasAttribute("aria-label")).toBe(false);
    });

    it("gives the queue's button its text as a tooltip and a label, beside its icon", async () => {
        const state = hass();
        const id = "sensor.wud_queue";
        const withQueue: HomeAssistant = {
            ...state,
            states: {
                ...state.states,
                [id]: { entity_id: id, state: "idle", last_changed: "2026-10-13T08:00:00Z", attributes: { items: [], stopping: false } },
            },
            entities: { ...state.entities, [id]: { entity_id: id, platform: "wud_queue" } },
        };
        const element = await card(withQueue);
        const button = one(element, "button.action")!;
        expect(button.getAttribute("title")).toBe("Päivitä kaikki");
        expect(button.getAttribute("aria-label")).toBe("Päivitä kaikki");
        expect(button.querySelector("ha-icon")?.getAttribute("icon")).toBe("mdi:update");
    });
});
