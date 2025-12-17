export function focusNextInput(current: HTMLElement | null) {
  if (!current) return;
  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement>("input:not([type=hidden])"),
  );
  const index = inputs.indexOf(current as HTMLInputElement);
  inputs[index + 1]?.focus();
}
