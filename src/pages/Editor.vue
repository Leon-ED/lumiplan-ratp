<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router"; 
import {
  Desserte,
  DesserteWithLine,
  Line,
  Mode,
  SaveFile,
  StopWithTime,
} from "../types";
import LineEditorModal from "../components/Editor/LineEditorModal.vue";
import StopEditorModal from "../components/Editor/StopEditorModal.vue";
import EditorSidebar from "../components/Editor/EditorSidebar.vue";
import ApiImportJourneyModal from "../components/Editor/ApiImportJourneyModal.vue";
import EditorStopList from "../components/Editor/EditorStopList.vue";
import AutosaveRestoreModal from "../components/Editor/AutosaveRestoreModal.vue"; 
import { sortedLines } from "../utils";

const router = useRouter(); 

const defaultLine: Line = {
  id: "editor-made-line",
  mode: Mode.BUS,
  name: "TODO !",
  color: "#4A6C1F",
  textColor: "#FFFFFF",
};
const defaultStop: StopWithTime = {
  stop: {
    id: "editor-made-stop",
    name: "",
    landmarkName: "",
    isAccessible: false,
    connectedLines: [],
  },
  timeOfArrival: "12:00",
  timeOfDeparture: "12:01",
  isTerminus: false,
  isFirstStop: false,
  isStopSkipped: false,
};
const defaultDesserte: DesserteWithLine = {
  line: defaultLine,
  desserte: {
    id: "editor-made-journey",
    direction: "Ma direction",
    stops: [
      {
        ...defaultStop,
        stop: { ...defaultStop.stop, name: "Arrêt Origine" },
        timeOfArrival: "08:00",
        isFirstStop: true,
      },
    ],
  },
};

const _lines = ref<Line[]>([defaultDesserte.line]);
const lines = computed(() => sortedLines(_lines.value));
const desserteWithLine = ref<DesserteWithLine>(defaultDesserte);
const saveFileName = ref<string>("Ma Desserte");

const selectedLineInModal = ref<Line | null>(null);
const selectedStopInModal = ref<StopWithTime | null>(null);
const lineModalRef = ref<InstanceType<typeof LineEditorModal> | null>(null);
const stopModalRef = ref<InstanceType<typeof StopEditorModal> | null>(null);
const apiModalRef = ref<InstanceType<typeof ApiImportJourneyModal> | null>(null);
const autosaveModalRef = ref<InstanceType<typeof AutosaveRestoreModal> | null>(null);

const sortedStops = computed(() => {
  return [...desserteWithLine.value.desserte.stops].sort((a, b) => {
    return (a.timeOfArrival || "00:00").localeCompare(
      b.timeOfArrival || "00:00",
    );
  });
});

const normalizeStopFlags = () => {
  const stops = sortedStops.value;

  if (stops.length === 0) return;
  if (stops.length === 1) {
    stops[0].isFirstStop = true;
    stops[0].isTerminus = false;
    return;
  }

  stops.forEach((stop, index) => {
    stop.isFirstStop = index === 0;
    stop.isTerminus = index === stops.length - 1;
  });
};

watch(
  () => desserteWithLine.value.desserte.stops,
  () => {
    normalizeStopFlags();
  },
  { deep: true, immediate: true },
);

const openLineEditorModal = (line: Line) => {
  selectedLineInModal.value = line;
  lineModalRef.value?.open();
};
const openStopEditorModal = (stop: StopWithTime) => {
  selectedStopInModal.value = stop;
  stopModalRef.value?.open();
};

const addLine = () =>
  lines.value.push({
    ...defaultLine,
    id: `editor-made-line-${crypto.randomUUID()}`,
  });

const addStop = () => {
  const lastTime =
    sortedStops.value.length > 0
      ? sortedStops.value[sortedStops.value.length - 1].timeOfArrival
      : "12:00";
  desserteWithLine.value.desserte.stops.push({
    ...defaultStop,
    stop: {
      ...defaultStop.stop,
      id: `editor-made-stop-${crypto.randomUUID()}`,
    },
    timeOfArrival: lastTime,
  });
  normalizeStopFlags();
};

const handleSelectBaseLine = (lineId: string) => {
  const selectedBaseLine = lines.value.find((l) => l.id === lineId);
  if (selectedBaseLine) {
    desserteWithLine.value.line = selectedBaseLine;
  }
};

const loadData = (parsedData: SaveFile, fallbackName: string) => {
  _lines.value = parsedData.lines;
  desserteWithLine.value = parsedData.journey;
  desserteWithLine.value.desserte.stops.forEach((stop: StopWithTime) => {
    stop.stop.connectedLines = lines.value.filter((line) =>
      stop.stop.connectedLines.some(
        (connectedLine) => connectedLine.id === line.id,
      )
    );
  });
  saveFileName.value = parsedData.header.name || fallbackName;
};

const applyImportedData = (jsonString: string) => {
  try {
    const parsedData = JSON.parse(jsonString) as SaveFile;
    if (
      parsedData?.header &&
      Array.isArray(parsedData.lines) &&
      parsedData.journey
    ) {
      if (
        confirm(
          "L'importation d'un fichier va écraser votre travail actuel. Continuer ?",
        )
      ) {
        loadData(parsedData, "Import JSON");
        alert(
          `Importation réussie : ${parsedData.header.name || "Projet sans nom"}`,
        );
      }
    } else alert("Le format du fichier JSON est invalide.");
  } catch {
    alert("Impossible de lire les données JSON.");
  }
};

const handleApiImport = (journey: Desserte) => {
  const uniqueLines = new Map<string, Line>();

  journey.stops.forEach((s) => {
    s.stop.connectedLines.forEach((l) => {
      if (!uniqueLines.has(l.id)) {
        uniqueLines.set(l.id, l);
      }
    });
  });
  journey.stops.forEach((s) => {
    s.stop.connectedLines = s.stop.connectedLines.map(
      (l) => uniqueLines.get(l.id) as Line,
    );
  });

  desserteWithLine.value.desserte = journey;
  _lines.value = Array.from(uniqueLines.values());
  saveFileName.value = `Import_${journey.id}`;
};

const copySuccess = ref(false);
const downloadSuccess = ref(false);

const getExportData = (): string =>
  JSON.stringify(
    {
      header: {
        dateTime: new Date().toISOString(),
        version: "1.0.0",
        name: saveFileName.value || "Sauvegarde",
      },
      lines: lines.value,
      journey: {
        ...desserteWithLine.value,
        desserte: {
          ...desserteWithLine.value.desserte,
          stops: sortedStops.value,
        },
      },
    },
    null,
    2,
  );

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(getExportData());
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch {
    alert("Impossible de copier.");
  }
};

const openApiModal = () => {
  apiModalRef.value?.open();
};

const downloadJson = () => {
  try {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([getExportData()], { type: "application/json" }),
    );
    link.download = `${(saveFileName.value || "desserte").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    link.click();
    downloadSuccess.value = true;
    setTimeout(() => {
      downloadSuccess.value = false;
    }, 2000);
  } catch {
    alert("Impossible de télécharger.");
  }
};
const AUTOSAVE_KEY = "lumiplan_editor_autosave_data";
const isReadyForAutosave = ref(false);

const handleAutosaveRestore = (parsedData: SaveFile) => {
  loadData(parsedData, parsedData.header.name);
};

const launchScreen = () => {
  localStorage.setItem(AUTOSAVE_KEY, getExportData());
  const routeData = router.resolve({ path: '/screen', query: { loadSave: 'true' } });
  window.open(routeData.href, '_blank');
};

onMounted(() => {
  const autosaveData = localStorage.getItem(AUTOSAVE_KEY);
  if (autosaveData) {
    try {
      const parsedData = JSON.parse(autosaveData) as SaveFile;
      if (
        parsedData?.header &&
        Array.isArray(parsedData.lines) &&
        parsedData.journey
      ) {
        autosaveModalRef.value?.open(parsedData);
      }
    } catch (e) {
      console.error("Erreur lors de la lecture de la sauvegarde automatique.", e);
    }
  }

  setTimeout(() => {
    isReadyForAutosave.value = true;
  }, 500);
});

watch(
  () => [desserteWithLine.value, _lines.value, saveFileName.value],
  () => {
    if (!isReadyForAutosave.value) return;
    localStorage.setItem(AUTOSAVE_KEY, getExportData());
  },
  { deep: true }
);
const deleteLine = (line: Line) => {
  _lines.value = _lines.value.filter((l) => l.id !== line.id);
};
</script>

<template>
  <div class="page-wrapper">
    <LineEditorModal ref="lineModalRef" :line="selectedLineInModal" />
    <StopEditorModal
      ref="stopModalRef"
      :all-lines="lines"
      :stop="selectedStopInModal"
    />
    <ApiImportJourneyModal ref="apiModalRef" @import="handleApiImport" />
    <AutosaveRestoreModal ref="autosaveModalRef" @restore="handleAutosaveRestore" />

    <div class="editor-layout">
      <header class="page-header">
        <div class="header-titles">
          <h1>Éditeur de Services</h1>
          <p>Configurez vos lignes et les arrêts de votre service.</p>
        </div>
        <button class="btn-launch-screen" @click="launchScreen">
          <span class="launch-icon">▶</span>
          Lancer l'écran
        </button>
      </header>

      <div class="editor-grid">
        <EditorSidebar
          :lines="lines"
          :selected-line="desserteWithLine.line"
          v-model:fileName="saveFileName"
          :copySuccess="copySuccess"
          :downloadSuccess="downloadSuccess"
          @add-line="addLine"
          @edit-line="openLineEditorModal"
          @copy-export="copyToClipboard"
          @select-base-line="handleSelectBaseLine"
          @download-export="downloadJson"
          @open-api="openApiModal"
          @import-json="applyImportedData"
          @delete-line="deleteLine"
        />

        <EditorStopList
          :desserteWithLine="desserteWithLine"
          :sortedStops="sortedStops"
          :allLines="lines"
          @edit-operated-line="openLineEditorModal"
          @add-stop="addStop"
          @edit-stop="openStopEditorModal"
          @select-base-line="handleSelectBaseLine"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.page-wrapper {
  min-height: 100vh;
  background-color: #f4f7f8;
  padding: 32px 16px;
  font-family: inherit;
  color: #333;
}
.editor-layout {
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 32px;
  display: flex; 
  justify-content: space-between;
  align-items: center;
}
.header-titles h1 {
  margin: 0 0 8px 0;
  font-size: 2.2rem;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}
.header-titles p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.btn-launch-screen {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  transition: all 0.2s ease;
}
.btn-launch-screen:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}
.btn-launch-screen:active {
  transform: translateY(0);
}
.launch-icon {
  font-size: 1.2rem;
}

.editor-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  align-items: start;
}

@media (max-width: 850px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .btn-launch-screen {
    width: 100%;
    justify-content: center;
  }
  .editor-grid {
    grid-template-columns: 1fr;
  }
}
</style>