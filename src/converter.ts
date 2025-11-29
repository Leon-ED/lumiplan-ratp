import { Mode } from "./types";

export class Converter {

    static convertLineMode(mode: string): Mode {
        console.log("Converting mode:", mode);
        if(mode === "bus_remplacement") {
            return Mode.BUS;
        }
        return mode.toUpperCase() as Mode;
    }

}
