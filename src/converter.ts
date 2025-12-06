import { InfoTraffic, Mode } from "./types";

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

    static convertInfoTraffic(object: any): InfoTraffic {
        const infoTraffic: InfoTraffic = {
            effect: object.type,
            id: object.ref,
            title: object.title,
            message: object.message,
            status: object.status,
            impactedLines: object.impactedLines
        };
        return infoTraffic;
    }


}
