import { PontJsonSchema } from "./dataType";
import { Parameter } from "./parameter";
import { getDuplicateById } from "./utils";
const _ = require("lodash");

export { PontJsonSchema, Parameter };

export class Interface {
  consumes: string[];
  parameters: Parameter[];
  description: string;
  response: PontJsonSchema;
  method: string;
  name: string;
  path: string;
}

export class Mod {
  description: string;
  interfaces: Interface[] = [];
  name: string;

  constructor(mod: Partial<Mod>) {
    this.interfaces = _.orderBy(mod.interfaces, "path");
  }
}

export class BaseClass {
  name: string;
  schema: PontJsonSchema;
}

export class PontSpec {
  public name: string;
  public baseClasses: BaseClass[] = [];
  public mods: Mod[] = [];

  static reOrder(ds: PontSpec): PontSpec {
    return {
      ...ds,
      baseClasses: _.orderBy(ds.baseClasses, "name"),
      mods: _.orderBy(ds.mods, "name"),
    };
  }

  // validate the if the dataSource is valid
  static validateLock(ds: PontSpec) {
    const errors = [] as string[];

    ds.mods.forEach((mod) => {
      if (!mod.name) {
        errors.push(`lock 文件不合法，发现没有 name 属性的模块;`);
      }
    });

    ds.baseClasses.forEach((base) => {
      if (!base.name) {
        errors.push(`lock 文件不合法，发现没有 name 属性的基类;`);
      }
    });

    const dupMod = getDuplicateById(ds.mods, "name");
    const dupBase = getDuplicateById(ds.baseClasses, "name");

    if (dupMod) {
      errors.push(`模块 ${dupMod.name} 重复了。`);
    }
    if (dupBase) {
      errors.push(`基类 ${dupBase.name} 重复了。`);
    }

    if (errors && errors.length) {
      throw new Error(errors.join("\n"));
    }

    return errors;
  }

  static serialize(ds: PontSpec) {
    return JSON.stringify(ds, null, 2);
  }

  constructor(ds?: { mods: Mod[]; name: string; baseClasses: BaseClass[] }) {
    if (ds) {
      PontSpec.reOrder(ds);
    }
  }

  static constructorByName(name: string) {
    return {
      name,
      baseClasses: [] as BaseClass[],
      mods: [] as Mod[],
    } as PontSpec;
  }
}