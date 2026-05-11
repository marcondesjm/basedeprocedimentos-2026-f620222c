import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

describe("Button · a11y", () => {
  it("variantes padrão não têm violações", async () => {
    const { container } = render(
      <div>
        <Button>Salvar</Button>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button variant="destructive">Excluir</Button>
        <Button variant="outline" disabled>Aguarde</Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("botão somente-ícone exige aria-label", async () => {
    const { container } = render(
      <Button size="icon" aria-label="Voltar para o painel">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      </Button>,
    );
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByRole("button", { name: /voltar para o painel/i })).toBeInTheDocument();
  });

  it("aplica utilitários de foco visível", () => {
    render(<Button>Foco</Button>);
    const btn = screen.getByRole("button", { name: /foco/i });
    expect(btn.className).toMatch(/focus-visible:ring/);
  });
});