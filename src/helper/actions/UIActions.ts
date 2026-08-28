import { PageActions } from "./PageActions";
import { UIElementActions } from "./internal/UIElementActions";
import { EditBoxActions } from "./internal/EditBoxActions";
import { DropDownActions } from "./internal/DropDownActions";
import { CheckboxActions } from "./internal/CheckboxActions";

/**
 * UIActions - Thin facade that groups stateless UI helpers under one entry point.
 */
export class UIActions {
  public readonly element: UIElementActions;
  public readonly editBox: EditBoxActions;
  public readonly dropdown: DropDownActions;
  public readonly checkbox: CheckboxActions;

  constructor(pageActions: PageActions) {
    this.element = new UIElementActions(pageActions);
    this.editBox = new EditBoxActions(pageActions);
    this.dropdown = new DropDownActions(pageActions);
    this.checkbox = new CheckboxActions(pageActions);
  }
}
