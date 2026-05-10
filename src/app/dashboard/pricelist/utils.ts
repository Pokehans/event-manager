export function getUnitLabel(unit: string) {
  switch (unit) {
    case "person":
      return "pro Person";
    case "piece":
      return "pro Stück";
    case "portion":
      return "pro Portion";
    default:
      return unit;
  }
}