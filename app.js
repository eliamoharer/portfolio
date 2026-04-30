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
    created: "Jan 22, 2026",
    updated: "Feb 1, 2026",
    pushed: "Feb 1, 2026",
    size: "934 KB",
    language: "JavaScript",
    languages: "JavaScript, CSS, HTML",
    applicationType: "JavaScript Web App",
    visibility: "Public",
    defaultBranch: "main",
    pages: "Enabled",
    forks: "1",
    openIssues: "0",
    stars: "0",
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
    created: "Feb 11, 2026",
    updated: "Mar 13, 2026",
    pushed: "Mar 13, 2026",
    size: "1,342 KB",
    language: "Swift",
    languages: "Swift, Shell",
    applicationType: "Swift iOS App",
    visibility: "Public",
    defaultBranch: "main",
    pages: "Disabled",
    forks: "0",
    openIssues: "0",
    stars: "0",
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
    created: "Apr 14, 2026",
    updated: "Apr 14, 2026",
    pushed: "Apr 14, 2026",
    size: "71 KB",
    language: "TypeScript",
    languages: "TypeScript, CSS, JavaScript, HTML",
    applicationType: "TypeScript Interactive Visualization",
    visibility: "Public",
    defaultBranch: "main",
    pages: "Enabled",
    forks: "0",
    openIssues: "0",
    stars: "0",
  },
};

const desktop = document.querySelector("#desktop");
const desktopIcons = document.querySelectorAll(".desktop-icon");
const startButton = document.querySelector("#start-button");
const startMenu = document.querySelector("#start-menu");
const shutdownDialog = document.querySelector("#shutdown-dialog");
const shutdownConfirm = document.querySelector("[data-shutdown-confirm]");
const shutdownCancel = document.querySelector("[data-shutdown-cancel]");
const dialogLayer = document.querySelector("#dialog-layer");
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

const toolbarMenus = [
  {
    label: "File",
    items: [
      ["New Window", "new-window"],
      ["Open Project...", "open-project"],
      ["Save Source Code...", "save-source"],
      ["Print Resume...", "print-resume"],
      ["Close", "close-window"],
    ],
  },
  {
    label: "Edit",
    items: [
      ["Copy Project Link", "copy-project-link"],
      ["Copy GitHub Link", "copy-github-link"],
    ],
  },
  {
    label: "View",
    items: [
      ["Full Screen (F11)", "fullscreen-preview"],
      ["Refresh Preview (F5)", "refresh-preview"],
    ],
  },
  {
    label: "Tools",
    items: [
      ["Magnifier", "toggle-magnifier"],
      ["Project Properties", "project-properties"],
    ],
  },
  {
    label: "Help",
    items: [
      ["Help Topics (F1)", "help-topics"],
      ["About Developer", "about-developer"],
    ],
  },
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

  toolbarMenus.forEach((menu) => {
    const menuElement = document.createElement("div");
    menuElement.className = "toolbar-menu";
    const button = document.createElement("button");
    button.className = "toolbar-button";
    button.type = "button";
    button.dataset.menuToggle = menu.label.toLowerCase();
    button.textContent = menu.label;
    const dropdown = document.createElement("div");
    dropdown.className = "toolbar-menu__dropdown";
    dropdown.setAttribute("role", "menu");

    menu.items.forEach(([label, action]) => {
      const item = document.createElement("button");
      item.className = "toolbar-menu__item";
      item.type = "button";
      item.dataset.toolbarAction = action;
      item.setAttribute("role", "menuitem");
      item.textContent = label;
      dropdown.append(item);
    });

    menuElement.append(button, dropdown);
    toolbar.append(menuElement);
  });

  return toolbar;
}

function createWindow(projectId) {
  const project = getProject(projectId);
  const targetUrl = getTargetUrl(project);
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
  preview.tabIndex = -1;
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
    iframe,
    preview,
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
  record.windowElement.querySelectorAll("[data-menu-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const menu = event.currentTarget.closest(".toolbar-menu");
      const shouldOpen = !menu.classList.contains("is-open");
      closeToolbarMenus(record.windowElement);
      menu.classList.toggle("is-open", shouldOpen);
    });
  });
  record.windowElement.querySelectorAll("[data-toolbar-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      handleToolbarAction(record, event.currentTarget.dataset.toolbarAction);
    });
  });
  record.preview.addEventListener("mousemove", (event) => updateMagnifier(event, record.preview));
  record.preview.addEventListener("mouseleave", () => {
    record.preview.style.removeProperty("--magnifier-x");
    record.preview.style.removeProperty("--magnifier-y");
  });
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

function closeToolbarMenus(scope = document) {
  scope.querySelectorAll(".toolbar-menu.is-open").forEach((menu) => {
    menu.classList.remove("is-open");
  });
}

function getTargetUrl(project) {
  return project.website || project.source;
}

function getActiveRecord() {
  return openWindows.get(activeProjectId) || null;
}

function closeDialog() {
  dialogLayer.classList.remove("is-open");
  dialogLayer.innerHTML = "";
}

function openXpDialog(title, content, options = {}) {
  dialogLayer.innerHTML = "";
  dialogLayer.classList.add("is-open");

  const dialog = document.createElement("article");
  dialog.className = `portfolio-dialog ${options.className || ""}`.trim();
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const titlebar = document.createElement("header");
  titlebar.className = "portfolio-dialog__titlebar";
  const titleText = document.createElement("span");
  titleText.textContent = title;
  const closeButton = document.createElement("button");
  closeButton.className = "window-control window-control--close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", `Close ${title}`);
  closeButton.addEventListener("click", closeDialog);
  titlebar.append(titleText, closeButton);

  const body = document.createElement("div");
  body.className = "portfolio-dialog__body";
  body.append(content);

  dialog.append(titlebar, body);
  dialogLayer.append(dialog);
  closeButton.focus();
}

function showMessageDialog(title, message) {
  const content = document.createElement("div");
  content.className = "message-dialog";
  const text = document.createElement("p");
  text.textContent = message;
  const okButton = document.createElement("button");
  okButton.className = "xp-button xp-button--primary";
  okButton.type = "button";
  okButton.textContent = "OK";
  okButton.addEventListener("click", closeDialog);
  content.append(text, okButton);
  openXpDialog(title, content, { className: "portfolio-dialog--message" });
  okButton.focus();
}

function openProjectExplorer() {
  const content = document.createElement("div");
  content.className = "project-explorer";
  const intro = document.createElement("p");
  intro.textContent = "Choose a portfolio project to open:";
  const list = document.createElement("div");
  list.className = "project-explorer__list";

  Object.entries(projects).forEach(([projectId, project]) => {
    const button = document.createElement("button");
    button.className = "project-explorer__item";
    button.type = "button";
    const icon = createProjectIcon(project);
    const label = document.createElement("span");
    label.innerHTML = `<strong>${project.title}</strong><small>${project.applicationType}</small>`;
    button.append(icon, label);
    button.addEventListener("click", () => {
      closeDialog();
      openProjectWindow(projectId);
    });
    list.append(button);
  });

  content.append(intro, list);
  openXpDialog("Open Project", content, { className: "portfolio-dialog--explorer" });
}

function openProjectProperties(record) {
  const project = getProject(record.projectId);
  const content = document.createElement("div");
  content.className = "properties-dialog";
  content.innerHTML = `
    <div class="properties-heading"></div>
    <div class="properties-tabs" aria-label="Project properties tabs">
      <button class="properties-tab is-active" type="button" data-properties-tab="general">General</button>
      <button class="properties-tab" type="button" data-properties-tab="details">Details</button>
    </div>
    <div class="properties-panel" data-properties-panel="general">
      <dl class="properties-list"></dl>
    </div>
    <div class="properties-panel is-hidden" data-properties-panel="details">
      <dl class="properties-list"></dl>
    </div>
  `;
  const heading = content.querySelector(".properties-heading");
  heading.append(createProjectIcon(project), document.createTextNode(project.title));
  const createPropertyRows = (list, rows) => {
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = `${label}:`;
      description.textContent = value;
      row.append(term, description);
      list.append(row);
    });
  };

  createPropertyRows(content.querySelector('[data-properties-panel="general"] .properties-list'), [
    ["Updated", project.updated],
    ["Size", project.size],
    ["Language", project.language],
    ["Website", project.website || "None"],
  ]);
  createPropertyRows(content.querySelector('[data-properties-panel="details"] .properties-list'), [
    ["Type", project.applicationType],
    ["Languages", project.languages],
    ["Created", project.created],
    ["Pushed", project.pushed],
    ["Visibility", project.visibility],
    ["Pages", project.pages],
    ["Branch", project.defaultBranch],
    ["Stars", project.stars],
    ["Forks", project.forks],
    ["Issues", project.openIssues],
    ["Repository", project.source],
  ]);

  content.querySelectorAll("[data-properties-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedTab = tab.dataset.propertiesTab;
      content.querySelectorAll("[data-properties-tab]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.propertiesTab === selectedTab);
      });
      content.querySelectorAll("[data-properties-panel]").forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.propertiesPanel !== selectedTab);
      });
    });
  });

  openXpDialog(`${project.title} Properties`, content, { className: "portfolio-dialog--properties" });
}

function openHelpViewer() {
  const helpSections = {
    gettingStarted: {
      title: "How to navigate",
      body: `
        <p>Double-click a desktop project icon or choose a project from Start to open a preview window.</p>
        <p>Use the taskbar buttons to switch between open project windows. Drag desktop icons and windows just like a classic Windows XP desktop.</p>
        <p>The File, Edit, View, Tools, and Help menus provide shortcuts for opening projects, copying links, refreshing previews, and viewing project properties.</p>
      `,
    },
    projects: {
      title: "Projects",
      body: `
        <p>The desktop currently includes three portfolio projects:</p>
        <ul>
          <li><strong>Calorelia</strong> - a JavaScript calorie tracker with a live GitHub Pages preview.</li>
          <li><strong>EliAI</strong> - a Swift iOS AI assistant project available through its GitHub repository.</li>
          <li><strong>EML Visualizer</strong> - a TypeScript visualization project with a live GitHub Pages preview.</li>
        </ul>
        <p>Choose <strong>File &gt; Open Project...</strong> to browse all projects in a retro file explorer dialog.</p>
      `,
    },
    windows: {
      title: "Windows",
      body: `
        <p>Each project opens in its own Windows XP-style browser window with a toolbar, address bar, preview pane, and project information pane.</p>
        <ul>
          <li>Use the titlebar buttons to minimize, maximize, or close a project window.</li>
          <li>Use <strong>View &gt; Full Screen (F11)</strong> to expand only the preview area.</li>
          <li>Use <strong>View &gt; Refresh Preview (F5)</strong> to reload the live preview iframe.</li>
          <li>Use <strong>Tools &gt; Magnifier</strong> to zoom the preview while hovering over it.</li>
        </ul>
      `,
    },
  };
  const content = document.createElement("div");
  content.className = "help-viewer";
  content.innerHTML = `
    <aside class="help-viewer__sidebar">
      <strong>Portfolio Help</strong>
      <button class="is-active" type="button" data-help-section="gettingStarted">Getting Started</button>
      <button type="button" data-help-section="projects">Projects</button>
      <button type="button" data-help-section="windows">Windows</button>
    </aside>
    <section class="help-viewer__content"></section>
  `;
  const helpContent = content.querySelector(".help-viewer__content");
  const renderHelpSection = (sectionName) => {
    const section = helpSections[sectionName] || helpSections.gettingStarted;
    helpContent.innerHTML = `<h2>${section.title}</h2>${section.body}`;
    content.querySelectorAll("[data-help-section]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.helpSection === sectionName);
    });
  };

  content.querySelectorAll("[data-help-section]").forEach((button) => {
    button.addEventListener("click", () => {
      renderHelpSection(button.dataset.helpSection);
    });
  });

  renderHelpSection("gettingStarted");
  openXpDialog("Portfolio Help", content, { className: "portfolio-dialog--help" });
}

function openAboutDeveloper() {
  const content = document.createElement("div");
  content.className = "about-dialog";
  content.innerHTML = `
    <div class="about-dialog__logo">XP</div>
    <div>
      <h2>Elia Moharer</h2>
      <p>Developer portfolio featuring polished web, visualization, and app projects in a Windows XP themed desktop.</p>
      <p>Projects: Calorelia, EliAI, and EML Visualizer.</p>
    </div>
  `;
  openXpDialog("About Developer", content, { className: "portfolio-dialog--about" });
}

function openPrintableResume() {
  const resumeWindow = window.open("", "_blank");

  if (!resumeWindow) {
    showMessageDialog("Print Resume", "The browser blocked the resume window. Please allow popups and try again.");
    return;
  }

  const projectItems = Object.values(projects)
    .map(
      (project) =>
        `<li><strong>${project.title}</strong> - ${project.description} <br><small>${project.source}</small></li>`,
    )
    .join("");

  resumeWindow.document.write(`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Elia Moharer Resume</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 36px; color: #111; }
          h1 { margin-bottom: 4px; }
          h2 { margin-top: 26px; border-bottom: 1px solid #bbb; padding-bottom: 4px; }
          li { margin-bottom: 12px; }
          small { color: #444; }
        </style>
      </head>
      <body>
        <h1>Elia Moharer</h1>
        <p>Developer portfolio: web apps, iOS projects, and interactive visualizations.</p>
        <h2>Selected Projects</h2>
        <ul>${projectItems}</ul>
      </body>
    </html>`);
  resumeWindow.document.close();
  resumeWindow.focus();
  window.setTimeout(() => resumeWindow.print(), 250);
}

function writeClipboard(text, successTitle) {
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showMessageDialog(successTitle, "Copied to clipboard."))
      .catch(() => {
        fallbackCopy();
        showMessageDialog(successTitle, "Copied to clipboard.");
      });
    return;
  }

  fallbackCopy();
  showMessageDialog(successTitle, "Copied to clipboard.");
}

function refreshPreview(record) {
  if (!record.iframe.src) {
    showMessageDialog("Refresh Preview", "This project uses a static preview card.");
    return;
  }

  record.iframe.src = record.iframe.src;
}

function exitPreviewFullscreen() {
  document.querySelectorAll(".project-preview.is-preview-fullscreen").forEach((preview) => {
    preview.classList.remove("is-preview-fullscreen");
  });

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

function togglePreviewFullscreen(record) {
  if (record.preview.classList.contains("is-preview-fullscreen")) {
    exitPreviewFullscreen();
    return;
  }

  record.preview.classList.add("is-preview-fullscreen");
  const fullscreenRequest = record.preview.requestFullscreen?.();
  fullscreenRequest?.catch(() => {});
}

function updateMagnifier(event, preview) {
  if (!preview.classList.contains("is-magnifying")) {
    return;
  }

  const rect = preview.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  preview.style.setProperty("--magnifier-x", `${Math.max(0, Math.min(100, x))}%`);
  preview.style.setProperty("--magnifier-y", `${Math.max(0, Math.min(100, y))}%`);
}

function toggleMagnifier(record) {
  record.preview.classList.toggle("is-magnifying");
}

function handleToolbarAction(record, action) {
  const project = getProject(record.projectId);
  const targetUrl = getTargetUrl(project);

  closeToolbarMenus(record.windowElement);

  if (action === "new-window") {
    window.open(window.location.href, "_blank", "noopener");
  }

  if (action === "open-project") {
    openProjectExplorer();
  }

  if (action === "save-source") {
    window.open(project.source, "_blank", "noopener,noreferrer");
  }

  if (action === "print-resume") {
    openPrintableResume();
  }

  if (action === "close-window") {
    minimizeProjectWindow(record.projectId);
  }

  if (action === "copy-project-link") {
    writeClipboard(targetUrl, "Copy Project Link");
  }

  if (action === "copy-github-link") {
    writeClipboard(project.source, "Copy GitHub Link");
  }

  if (action === "fullscreen-preview") {
    togglePreviewFullscreen(record);
  }

  if (action === "refresh-preview") {
    refreshPreview(record);
  }

  if (action === "toggle-magnifier") {
    toggleMagnifier(record);
  }

  if (action === "project-properties") {
    openProjectProperties(record);
  }

  if (action === "help-topics") {
    openHelpViewer();
  }

  if (action === "about-developer") {
    openAboutDeveloper();
  }
}

function openShutdownDialog() {
  closeStartMenu();
  shutdownDialog.classList.add("is-open");
  shutdownDialog.setAttribute("aria-hidden", "false");
  shutdownCancel.focus();
}

function closeShutdownDialog() {
  shutdownDialog.classList.remove("is-open");
  shutdownDialog.setAttribute("aria-hidden", "true");
}

function confirmShutdown() {
  window.close();

  // Browsers only allow scripts to close tabs that were opened by script.
  window.setTimeout(() => {
    document.body.innerHTML = "";
    document.body.style.background = "#000";
  }, 150);
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

  const menuAction = event.target.closest("[data-menu-action]")?.dataset.menuAction;

  if (menuAction === "shutdown") {
    openShutdownDialog();
    return;
  }

  if (menuAction) {
    closeStartMenu();
  }
});

shutdownConfirm.addEventListener("click", confirmShutdown);
shutdownCancel.addEventListener("click", closeShutdownDialog);

shutdownDialog.addEventListener("click", (event) => {
  if (event.target === shutdownDialog) {
    closeShutdownDialog();
  }
});

dialogLayer.addEventListener("click", (event) => {
  if (event.target === dialogLayer) {
    closeDialog();
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

  closeToolbarMenus();
  closeStartMenu();
});

document.addEventListener("click", () => {
  closeToolbarMenus();
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener(
  "touchmove",
  (event) => {
    event.preventDefault();
  },
  { passive: false },
);

document.addEventListener("gesturestart", (event) => {
  event.preventDefault();
});

document.addEventListener("mousemove", dragWindow);
document.addEventListener("mousemove", dragDesktopIcon);
document.addEventListener("mouseup", stopWindowDrag);
document.addEventListener("mouseup", stopIconDrag);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector(".project-preview.is-preview-fullscreen")) {
    exitPreviewFullscreen();
    return;
  }

  if (event.key === "Escape" && dialogLayer.classList.contains("is-open")) {
    closeDialog();
    return;
  }

  if (event.key === "Escape" && shutdownDialog.classList.contains("is-open")) {
    closeShutdownDialog();
    return;
  }

  if (event.key === "Escape" && startMenu.classList.contains("is-open")) {
    closeStartMenu();
    return;
  }

  if (event.key === "Escape" && openWindows.has(activeProjectId)) {
    closeProjectWindow(activeProjectId);
  }

  if (event.key === "F1") {
    event.preventDefault();
    openHelpViewer();
  }

  if (event.key === "F5") {
    const record = getActiveRecord();

    if (record) {
      event.preventDefault();
      refreshPreview(record);
    }
  }

  if (event.key === "F11") {
    const record = getActiveRecord();

    if (record) {
      event.preventDefault();
      togglePreviewFullscreen(record);
    }
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    document.querySelectorAll(".project-preview.is-preview-fullscreen").forEach((preview) => {
      preview.classList.remove("is-preview-fullscreen");
    });
  }
});

updateTrayVolumeIcon();
updateClock();
setInterval(updateClock, 1000 * 30);
