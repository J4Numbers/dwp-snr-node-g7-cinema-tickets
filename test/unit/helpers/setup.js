const { describe, it } = import("mocha");
import { use, expect } from "chai";
import sinon from "sinon";

import sinonChai from "sinon-chai";

use(sinonChai);

global.describe = describe;
global.it = it;

global.sinon = sinon;
global.expect = expect;
