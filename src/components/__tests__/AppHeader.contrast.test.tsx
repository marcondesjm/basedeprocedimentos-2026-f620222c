import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { axe } from "vitest-axe";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/AppHeader";
import "@/index.css";

declare const process: { env: Record<string, string | undefined> } | undefined;
const IS_BROWSER =
  typeof process !== "undefined" && process?.env?.A11Y_BROWSER === "1";

const setViewport = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: 800 });
  window.dispatchEvent(new Event("resize"));
};

const renderWithTheme = (theme: "light" | "dark", isAppUpToDate: boolean) => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  return render(
    <div className={theme === "dark" ? "dark bg-background text-foreground" : "bg-background text-foreground"}>
      <SidebarProvider>
        <AppHeader currentDateTime={new Date("2026-05-11T10:30:00")} isAppUpToDate={isAppUpToDate} />
      </SidebarProvider>
    </div>,
  );
};

const widths = [360, 768, 1280, 1920];
const themes = ["light", "dark"] as const;

describe("AppHeader · contraste e estados aria-live", () => {
  beforeEach(() => {
    cleanup();
    document.documentElement.className = "";
  });

  for (const theme of themes) {
    for (const width of widths) {
      it(`tema ${theme} @ ${width}px — sem violações axe (incluindo color-contrast quando suportado)`, async () => {
        setViewport(width);
        const { container } = renderWithTheme(theme, true);
        const results = await axe(container, {
          rules: {
            "color-contrast": { enabled: IS_BROWSER },
            "color-contrast-enhanced": { enabled: IS_BROWSER },
            region: { enabled: false },
          },
        });
        expect(results).toHaveNoViolations();
      });
    }
  }

  it("badge 'Atualizado' está em região com aria-live=polite e aria-atomic=true", () => {
    renderWithTheme("light", true);
    const status = screen.getByTestId("app-update-status");
    expect(status).toHaveAttribute("role", "status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(status).toHaveTextContent(/atualizado/i);
  });

  it("botão 'Atualizar' aparece dentro da mesma região aria-live ao mudar estado", () => {
    const { rerender } = renderWithTheme("dark", true);
    expect(screen.getByTestId("app-update-status")).toHaveTextContent(/atualizado/i);

    rerender(
      <div className="dark">
        <SidebarProvider>
          <AppHeader currentDateTime={new Date("2026-05-11T10:30:00")} isAppUpToDate={false} />
        </SidebarProvider>
      </div>,
    );

    const status = screen.getByTestId("app-update-status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(/atualizar/i);
    const updateBtn = screen.getByRole("button", { name: /atualizar a aplica/i });
    expect(status).toContainElement(updateBtn);
  });

  it("botão 'Atualizar' não tem violações axe nos dois temas", async () => {
    for (const theme of themes) {
      cleanup();
      const { container } = renderWithTheme(theme, false);
      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: IS_BROWSER },
          region: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    }
  });
});