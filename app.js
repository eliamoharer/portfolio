const projects = {
  calorelia: {
    title: "Calorelia",
    eyebrow: "Internet Shortcut",
    description:
      "Calorelia is a calorie tracker built as a lightweight web app. It gives visitors a focused way to track meals and calories from a simple browser interface.",
    type: "Web app",
    status: "Online project",
    website: "https://eliamoharer.github.io/Calorelia/",
    source: "https://github.com/eliamoharer/Calorelia",
    primaryLabel: "Open Website",
    iconClass: "project-icon--calorelia",
    previewLabel: "Live Calorelia website preview",
  },
  eliai: {
    title: "EliAI",
    eyebrow: "GitHub Project",
    description:
      "EliAI is a local, privacy-first iOS personal AI assistant. It runs models on-device, supports agentic tools, and keeps user data local.",
    type: "iOS app",
    status: "Source available",
    website: "",
    source: "https://github.com/eliamoharer/EliAI",
    primaryLabel: "View Source",
    iconClass: "project-icon--eliai",
    previewLabel:
      "EliAI is an iOS app project. Open the source repository to view the full build and installation details.",
  },
  emlvisualizer: {
    title: "EML Visualizer",
    eyebrow: "Internet Shortcut",
    description:
      "EML Visualizer is an interactive visualization of the EML operator and the elementary functions reachable from it.",
    type: "Interactive visualization",
    status: "Online project",
    website: "https://eliamoharer.github.io/EMLVisualizer/",
    source: "https://github.com/eliamoharer/EMLVisualizer",
    primaryLabel: "Open Website",
    iconClass: "project-icon--emlvisualizer",
    previewLabel: "Live EML Visualizer website preview",
  },
};

const desktop = document.querySelector("#desktop");
const desktopIcons = document.querySelectorAll(".desktop-icon");
const startButton = document.querySelector("#start-button");
const startMenu = document.querySelector("#start-menu");
const windowLayer = document.querySelector("#window-layer");
const taskbarPrograms = document.querySelector("#taskbar-programs");
const taskbarClock = document.querySelector("#taskbar-clock");
const trayVolume = document.querySelector("#tray-volume");
const projectLaunchers = document.querySelectorAll("[data-project]");
const iconClassNames = Object.values(projects).map((project) => project.iconClass);

const sounds = {
  menu: "WinXp/Sounds/Windows XP Menu Command.wav",
  open: "WinXp/Sounds/Windows XP Start.wav",
  minimize: "WinXp/Sounds/Windows XP Minimize.wav",
  restore: "WinXp/Sounds/Windows XP Restore.wav",
};

const openWindows = new Map();
let activeProjectId = "calorelia";
let highestZIndex = 10;
let windowDragState = null;
let iconDragState = null;
let suppressedIcon = null;
let siteVolumeIndex = 2;

const siteVolumeLevels = [
  { className: "volume-muted", label: "muted", volume: 0 },
  { className: "volume-low", label: "low", volume: 0.16 },
  { className: "volume-medium", label: "medium", volume: 0.32 },
  { className: "volume-high", label: "high", volume: 0.55 },
];

function playSound(soundName) {
  const soundPath = sounds[soundName];

  if (!soundPath) {
    return;
  }

  const audio = new Audio(soundPath);
  audio.volume = siteVolumeLevels[siteVolumeIndex].volume;
  audio.play().catch(() => {
    // Browsers can block short UI sounds until the page has received a gesture.
  });
}

function updateTrayVolumeIcon() {
  const level = siteVolumeLevels[siteVolumeIndex];
  trayVolume.classList.remove(...siteVolumeLevels.map((item) => item.className));
  trayVolume.classList.add(level.className);
  trayVolume.setAttribute("aria-label", `Site sound volume: ${level.label}`);
}

function cycleSiteVolume() {
  siteVolumeIndex = (siteVolumeIndex + 1) % siteVolumeLevels.length;
  updateTrayVolumeIcon();
  playSound("menu");
}

function getProject(projectId) {
  return projects[projectId] || projects.calorelia;
}

function setIconClass(element, iconClass) {
  element.classList.remove(...iconClassNames);
  element.classList.add(iconClass);
}

function selectDesktopIcon(projectId) {
  desktopIcons.forEach((icon) => {
    icon.classList.toggle("is-selected", icon.dataset.project === projectId);
  });
}

function createProjectIcon(project) {
  const icon = document.createElement("span");
  icon.className = `project-icon ${project.iconClass}`;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function createToolbar() {
  const toolbar = document.createElement("div");
  toolbar.className = "xp-window__toolbar";
  toolbar.setAttribute("aria-label", "Window toolbar");

  ["File", "Edit", "View", "Favorites", "Tools", "Help"].forEach((label) => {
    const button = document.createElement("button");
    button.className = "toolbar-button";
    button.type = "button";
    button.textContent = label;
    toolbar.append(button);
  });

  return toolbar;
}

function createWindow(projectId) {
  const project = getProject(projectId);
  const targetUrl = project.website || project.source;
  const titleId = `project-title-${projectId}`;
  const windowElement = document.createElement("section");
  windowElement.className = "xp-window is-open";
  windowElement.dataset.project = projectId;
  windowElement.setAttribute("aria-labelledby", titleId);
  windowElement.setAttribute("aria-hidden", "false");
  windowElement.style.left = `${128 + openWindows.size * 28}px`;
  windowElement.style.top = `${72 + openWindows.size * 24}px`;

  const titlebar = document.createElement("header");
  titlebar.className = "xp-window__titlebar";
  const title = document.createElement("div");
  title.className = "xp-window__title";
  const titleIcon = createProjectIcon(project);
  titleIcon.classList.add("xp-window__title-icon");
  const titleText = document.createElement("span");
  titleText.id = titleId;
  titleText.textContent = project.title;
  title.append(titleIcon, titleText);

  const controls = document.createElement("div");
  controls.className = "xp-window__controls";
  controls.setAttribute("aria-label", "Window controls");
  [
    ["minimize", "Minimize project window"],
    ["maximize", "Maximize project window"],
    ["close", "Close project window"],
  ].forEach(([action, label]) => {
    const button = document.createElement("button");
    button.className = `window-control window-control--${action}`;
    button.type = "button";
    button.dataset.windowAction = action;
    button.setAttribute("aria-label", label);
    controls.append(button);
  });

  titlebar.append(title, controls);

  const body = document.createElement("div");
  body.className = "xp-window__body";
  const addressBar = document.createElement("div");
  addressBar.className = "address-bar";
  addressBar.setAttribute("aria-label", "Address");
  const addressLabel = document.createElement("span");
  addressLabel.className = "address-bar__label";
  addressLabel.textContent = "Address";
  const addressField = document.createElement("span");
  addressField.className = "address-bar__field";
  const addressIcon = createProjectIcon(project);
  addressIcon.classList.add("address-bar__icon");
  const addressText = document.createElement("span");
  addressText.textContent = targetUrl;
  addressField.append(addressIcon, addressText);
  const goLink = document.createElement("a");
  goLink.className = "address-bar__go";
  goLink.href = targetUrl;
  goLink.target = "_blank";
  goLink.rel = "noreferrer";
  goLink.textContent = "Go";
  addressBar.append(addressLabel, addressField, goLink);

  const preview = document.createElement("div");
  preview.className = "project-preview";
  const iframe = document.createElement("iframe");
  iframe.title = `${project.title} website preview`;
  iframe.loading = "lazy";
  const previewCard = document.createElement("article");
  previewCard.className = "project-preview-card";
  previewCard.setAttribute("aria-hidden", "true");
  const previewIcon = createProjectIcon(project);
  previewIcon.classList.add("project-preview-card__icon");
  const previewLabel = document.createElement("p");
  previewLabel.className = "project-preview-card__label";
  previewLabel.textContent = project.previewLabel;
  previewCard.append(previewIcon, previewLabel);

  if (project.website) {
    iframe.src = project.website;
  } else {
    iframe.classList.add("is-hidden");
    previewCard.classList.add("is-visible");
    previewCard.setAttribute("aria-hidden", "false");
  }

  preview.append(iframe, previewCard);

  const details = document.createElement("div");
  details.className = "project-details";
  details.innerHTML = `
    <p class="project-details__eyebrow"></p>
    <h1></h1>
    <p class="project-details__description"></p>
    <dl class="project-meta">
      <div><dt>Type</dt><dd></dd></div>
      <div><dt>Status</dt><dd></dd></div>
    </dl>
    <div class="project-actions"></div>
  `;
  details.querySelector(".project-details__eyebrow").textContent = project.eyebrow;
  details.querySelector("h1").textContent = project.title;
  details.querySelector(".project-details__description").textContent = project.description;
  const metaValues = details.querySelectorAll("dd");
  metaValues[0].textContent = project.type;
  metaValues[1].textContent = project.status;
  const actions = details.querySelector(".project-actions");
  const primaryLink = document.createElement("a");
  primaryLink.className = "xp-button xp-button--primary";
  primaryLink.href = targetUrl;
  primaryLink.target = "_blank";
  primaryLink.rel = "noreferrer";
  primaryLink.textContent = project.primaryLabel;
  const sourceLink = document.createElement("a");
  sourceLink.className = "xp-button";
  sourceLink.href = project.source;
  sourceLink.target = "_blank";
  sourceLink.rel = "noreferrer";
  sourceLink.textContent = "View Source";
  actions.append(primaryLink);

  if (project.website) {
    actions.append(sourceLink);
  }

  body.append(createToolbar(), addressBar, preview, details);
  windowElement.append(titlebar, body);
  windowLayer.append(windowElement);

  const taskbarButton = document.createElement("button");
  taskbarButton.className = "taskbar__program is-visible";
  taskbarButton.type = "button";
  taskbarButton.dataset.project = projectId;
  taskbarButton.setAttribute("aria-label", `Restore ${project.title}`);
  const taskbarIcon = createProjectIcon(project);
  const taskbarLabel = document.createElement("span");
  taskbarLabel.textContent = project.title;
  taskbarButton.append(taskbarIcon, taskbarLabel);
  taskbarPrograms.append(taskbarButton);

  const windowRecord = {
    projectId,
    taskbarButton,
    titlebar,
    windowElement,
  };
  openWindows.set(projectId, windowRecord);
  bindWindowEvents(windowRecord);
  focusWindow(projectId);
  return windowRecord;
}

function bindWindowEvents(record) {
  record.titlebar.addEventListener("mousedown", (event) => startWindowDrag(event, record));
  record.titlebar.addEventListener("dblclick", () => toggleMaximizeProjectWindow(record.projectId));
  record.windowElement.addEventListener("mousedown", () => focusWindow(record.projectId));
  record.windowElement.querySelectorAll("[data-window-action]").forEach((control) => {
    control.addEventListener("click", (event) => {
      const action = event.currentTarget.dataset.windowAction;

      if (action === "close") {
        closeProjectWindow(record.projectId);
      }

      if (action === "minimize") {
        minimizeProjectWindow(record.projectId);
      }

      if (action === "maximize") {
        toggleMaximizeProjectWindow(record.projectId);
      }
    });
  });

  record.taskbarButton.addEventListener("click", () => {
    if (record.windowElement.classList.contains("is-minimized")) {
      restoreProjectWindow(record.projectId);
      return;
    }

    if (activeProjectId === record.projectId) {
      minimizeProjectWindow(record.projectId);
      return;
    }

    restoreProjectWindow(record.projectId);
  });
}

function openProjectWindow(projectId) {
  const record = openWindows.get(projectId) || createWindow(projectId);
  activeProjectId = projectId;
  selectDesktopIcon(projectId);
  record.windowElement.classList.add("is-open");
  record.windowElement.classList.remove("is-minimized");
  record.windowElement.setAttribute("aria-hidden", "false");
  record.taskbarButton.classList.add("is-visible");
  record.taskbarButton.classList.remove("is-minimized");
  focusWindow(projectId);
  closeStartMenu();
  playSound("open");
}

function closeProjectWindow(projectId) {
  const record = openWindows.get(projectId);

  if (!record) {
    return;
  }

  record.windowElement.remove();
  record.taskbarButton.remove();
  openWindows.delete(projectId);

  if (activeProjectId === projectId) {
    const nextRecord = Array.from(openWindows.values()).pop();
    activeProjectId = nextRecord?.projectId || "calorelia";

    if (nextRecord) {
      focusWindow(nextRecord.projectId);
    }
  }
}

function minimizeProjectWindow(projectId) {
  const record = openWindows.get(projectId);

  if (!record) {
    return;
  }

  record.windowElement.classList.add("is-minimized");
  record.windowElement.setAttribute("aria-hidden", "true");
  record.taskbarButton.classList.add("is-minimized");
  playSound("minimize");
}

function restoreProjectWindow(projectId) {
  const record = openWindows.get(projectId) || createWindow(projectId);
  record.windowElement.classList.remove("is-minimized");
  record.windowElement.setAttribute("aria-hidden", "false");
  record.taskbarButton.classList.remove("is-minimized");
  focusWindow(projectId);
  closeStartMenu();
  playSound("restore");
}

function toggleMaximizeProjectWindow(projectId) {
  const record = openWindows.get(projectId);

  if (!record) {
    return;
  }

  record.windowElement.classList.toggle("is-maximized");
}

function focusWindow(projectId) {
  const record = openWindows.get(projectId);

  if (!record) {
    return;
  }

  highestZIndex += 1;
  activeProjectId = projectId;
  record.windowElement.style.zIndex = highestZIndex;
  openWindows.forEach((openRecord) => {
    openRecord.taskbarButton.classList.toggle("is-active", openRecord.projectId === projectId);
  });
}

function openStartMenu() {
  startMenu.classList.add("is-open");
  startMenu.setAttribute("aria-hidden", "false");
  startButton.classList.add("is-active");
  startButton.setAttribute("aria-expanded", "true");
  playSound("menu");
}

function closeStartMenu() {
  startMenu.classList.remove("is-open");
  startMenu.setAttribute("aria-hidden", "true");
  startButton.classList.remove("is-active");
  startButton.setAttribute("aria-expanded", "false");
}

function toggleStartMenu() {
  if (startMenu.classList.contains("is-open")) {
    closeStartMenu();
    return;
  }

  openStartMenu();
}

function updateClock() {
  const now = new Date();
  taskbarClock.textContent = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function startWindowDrag(event, record) {
  if (
    event.target.closest(".xp-window__controls") ||
    record.windowElement.classList.contains("is-maximized")
  ) {
    return;
  }

  focusWindow(record.projectId);
  const rect = record.windowElement.getBoundingClientRect();
  windowDragState = {
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    windowElement: record.windowElement,
  };
}

function dragWindow(event) {
  if (!windowDragState) {
    return;
  }

  const { windowElement } = windowDragState;
  const maxLeft = window.innerWidth - windowElement.offsetWidth - 8;
  const maxTop = window.innerHeight - windowElement.offsetHeight - 44;
  const nextLeft = Math.max(8, Math.min(maxLeft, event.clientX - windowDragState.offsetX));
  const nextTop = Math.max(8, Math.min(maxTop, event.clientY - windowDragState.offsetY));

  windowElement.style.left = `${nextLeft}px`;
  windowElement.style.top = `${nextTop}px`;
}

function stopWindowDrag() {
  windowDragState = null;
}

function startIconDrag(event) {
  const icon = event.currentTarget;

  if (event.button !== 0) {
    return;
  }

  const iconRect = icon.getBoundingClientRect();
  const desktopRect = desktop.getBoundingClientRect();

  iconDragState = {
    desktopRect,
    hasMoved: false,
    icon,
    offsetX: event.clientX - iconRect.left,
    offsetY: event.clientY - iconRect.top,
    startX: event.clientX,
    startY: event.clientY,
  };

  selectDesktopIcon(icon.dataset.project);
  closeStartMenu();
  event.stopPropagation();
}

function dragDesktopIcon(event) {
  if (!iconDragState) {
    return;
  }

  const distanceX = Math.abs(event.clientX - iconDragState.startX);
  const distanceY = Math.abs(event.clientY - iconDragState.startY);

  if (distanceX > 3 || distanceY > 3) {
    iconDragState.hasMoved = true;
    iconDragState.icon.classList.add("is-dragging");
  }

  if (!iconDragState.hasMoved) {
    return;
  }

  const maxLeft = desktop.clientWidth - iconDragState.icon.offsetWidth - 4;
  const maxTop = desktop.clientHeight - 36 - iconDragState.icon.offsetHeight - 4;
  const nextLeft = Math.max(
    4,
    Math.min(maxLeft, event.clientX - iconDragState.desktopRect.left - iconDragState.offsetX),
  );
  const nextTop = Math.max(
    4,
    Math.min(maxTop, event.clientY - iconDragState.desktopRect.top - iconDragState.offsetY),
  );

  iconDragState.icon.style.left = `${nextLeft}px`;
  iconDragState.icon.style.top = `${nextTop}px`;
}

function stopIconDrag() {
  if (!iconDragState) {
    return;
  }

  suppressedIcon = iconDragState.hasMoved ? iconDragState.icon : null;
  iconDragState.icon.classList.remove("is-dragging");
  iconDragState = null;
}

desktopIcons.forEach((icon) => {
  icon.addEventListener(
    "click",
    (event) => {
      if (suppressedIcon !== icon) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      suppressedIcon = null;
    },
    true,
  );

  icon.addEventListener("mousedown", startIconDrag);
});

projectLaunchers.forEach((launcher) => {
  launcher.addEventListener("click", (event) => {
    event.stopPropagation();
    openProjectWindow(event.currentTarget.dataset.project);
  });
});

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleStartMenu();
});

startMenu.addEventListener("click", (event) => {
  event.stopPropagation();

  if (event.target.closest("[data-menu-action]")) {
    closeStartMenu();
  }
});

trayVolume.addEventListener("click", (event) => {
  event.stopPropagation();
  cycleSiteVolume();
});

desktop.addEventListener("click", (event) => {
  if (!event.target.closest(".desktop-icon")) {
    desktopIcons.forEach((icon) => icon.classList.remove("is-selected"));
  }

  closeStartMenu();
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("mousemove", dragWindow);
document.addEventListener("mousemove", dragDesktopIcon);
document.addEventListener("mouseup", stopWindowDrag);
document.addEventListener("mouseup", stopIconDrag);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && startMenu.classList.contains("is-open")) {
    closeStartMenu();
    return;
  }

  if (event.key === "Escape" && openWindows.has(activeProjectId)) {
    closeProjectWindow(activeProjectId);
  }
});

updateTrayVolumeIcon();
updateClock();
setInterval(updateClock, 1000 * 30);
