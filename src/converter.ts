import { Mode } from "./types";

export class Converter {

    static convertLineMode(mode: string): Mode {
        if(mode === "bus_remplacement") {
            return Mode.BUS;
        }
        if(mode === "telepherique"){
            return Mode.CABLE;
        }
        return mode.toUpperCase() as Mode;
    }


}
