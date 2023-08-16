type CAObject = { condition: boolean; action: (...args: any[]) => any };
export function ca<T extends CAObject[] | CAObject>(
  caObject: T,
  altAction?: (...args: any[]) => any
) {
  if (caObject instanceof Array) {
    for (let i = 0; i < caObject.length; i++) {
      const caObjectElement = caObject[i];
      if (caObjectElement.condition) {
        caObjectElement.action();

        return;
      }
    }
  } else if (caObject.condition) {
    caObject.action();

    return;
  }
  altAction?.();
}
