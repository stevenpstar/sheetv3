// Pretty rough implementation, saving entire state of sheet. Will potentially
// implement nicer solution later.

import { App } from "../App.js";

function AddToUndoStack(stack: string[], state: string, state_index: { index: number }): void {
  if (state_index.index < stack.length - 1) {
    stack.splice(state_index.index + 1);
  }
  stack.push(state);
  state_index.index = stack.length - 1;
}

function LoadPreviousState(app: App): void {
  if (app.StateIndex.index === 0) {
    return;
  }
  app.StateIndex.index -= 1;

  app.LoadSheet(app.StateStack[app.StateIndex.index]);

  console.log(app.StateStack[app.StateIndex.index]);
}

function LoadNextState(app: App): void {
  if (app.StateIndex.index === app.StateStack.length - 1) {
    return;
  }

  app.StateIndex.index += 1;
  app.LoadSheet(app.StateStack[app.StateIndex.index]);
}

export {
  AddToUndoStack,
  LoadNextState,
  LoadPreviousState
};
