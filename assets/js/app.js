/* ===================================================================
   Console · Admin Design System — app.js   v1.0.0
   Vanilla JS. No framework, no build. Wires:
   · theme / accent / density switching (persisted in localStorage)
   · tabs · dropdown menu · combobox · popover · datepicker
   · modal · drawer · command palette · switch · tree · toast · dropzone
   Principle 08: keyboard flows complete, focus is restored, Esc closes.
   =================================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  var LS = { theme: "ads-theme", accent: "ads-accent", density: "ads-density" };

  /* ---- 1. Theme / accent / density (orthogonal, persisted) -------- */
  function apply(attr, value) {
    if (!value) return;
    root.setAttribute("data-" + attr, value);
    try { localStorage.setItem(LS[attr], value); } catch (e) {}
    // reflect pressed state on the matching switcher buttons
    document.querySelectorAll("[data-ads-" + attr + "]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-ads-" + attr) === value));
    });
  }
  function restore() {
    var t, a, d;
    try { t = localStorage.getItem(LS.theme); a = localStorage.getItem(LS.accent); d = localStorage.getItem(LS.density); } catch (e) {}
    apply("theme", t || root.getAttribute("data-theme") || "light");
    apply("accent", a || root.getAttribute("data-accent") || "indigo");
    apply("density", d || root.getAttribute("data-density") || "default");
  }
  restore();

  /* ---- 2. Overlay open/close (modal · drawer · command palette) --- */
  var lastTrigger = null;
  function focusables(el) {
    return Array.prototype.slice.call(el.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
  }
  function openOverlay(id, trigger) {
    var scrim = document.getElementById(id);
    if (!scrim) return;
    lastTrigger = trigger || document.activeElement;
    scrim.hidden = false;
    scrim.classList.add("is-open");
    var dialog = scrim.querySelector('[role="dialog"]') || scrim;
    var first = focusables(dialog)[0];
    (first || dialog).focus();
    if (id === "ads-cmdk") {
      var inp = scrim.querySelector(".ads-cmdk-input"); if (inp) inp.focus();
      var act0 = scrim.querySelector(".ads-cmdk-item.is-active");
      if (inp && act0 && act0.id) inp.setAttribute("aria-activedescendant", act0.id);
    }
  }
  function closeOverlay(scrim) {
    if (!scrim) return;
    scrim.hidden = true;
    scrim.classList.remove("is-open");
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }
  function topOverlay() {
    var open = document.querySelectorAll(".ads-scrim.is-open");
    return open.length ? open[open.length - 1] : null;
  }

  /* ---- 3. Inline poppers (menu · combobox · popover · datepicker) - */
  var POP_WRAP = ".ads-menu-wrap,.ads-combobox,.ads-pop-wrap,.ads-datepicker";
  var POP_PANEL = ".ads-menu,.ads-combo-pop,.ads-popover,.ads-cal";
  function closeAllPoppers(except) {
    document.querySelectorAll(POP_WRAP).forEach(function (wrap) {
      if (wrap === except) return;
      var panel = wrap.querySelector(POP_PANEL);
      var trig = wrap.querySelector("[aria-expanded]");
      if (panel && !panel.hidden) panel.hidden = true;
      if (trig) trig.setAttribute("aria-expanded", "false");
    });
  }
  function togglePopper(wrap) {
    var panel = wrap.querySelector(POP_PANEL);
    var trig = wrap.querySelector("[aria-expanded]") || wrap.querySelector("button");
    if (!panel) return;
    var willOpen = panel.hidden;
    closeAllPoppers(wrap);
    panel.hidden = !willOpen;
    if (trig) trig.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) { var f = focusables(panel)[0]; if (f) f.focus(); }
  }

  /* ---- 4. Toast helper -------------------------------------------- */
  function toast(msg, kind) {
    var stack = document.querySelector(".ads-toast-stack");
    if (!stack) { stack = document.createElement("div"); stack.className = "ads-toast-stack"; document.body.appendChild(stack); }
    var icon = { success: "✓", error: "×", info: "i" }[kind || "success"] || "✓";
    var el = document.createElement("div");
    el.className = "ads-toast";
    el.setAttribute("role", kind === "error" ? "alert" : "status");
    el.innerHTML = '<span class="ads-toast-icon ads-toast-' + (kind || "success") + '">' + icon + "</span>" +
      '<span class="ads-toast-msg"></span>' +
      '<button class="ads-btn ads-btn-ghost ads-btn-sm" data-ads-toast-close>닫기</button>';
    el.querySelector(".ads-toast-msg").textContent = msg;
    stack.appendChild(el);
    var timer = setTimeout(remove, 5000);
    function remove() { clearTimeout(timer); el.remove(); }
    el.querySelector("[data-ads-toast-close]").addEventListener("click", remove);
  }

  /* ---- 5. Global click delegation --------------------------------- */
  document.addEventListener("click", function (e) {
    var t = e.target;

    var themeBtn = t.closest("[data-ads-theme]"); if (themeBtn) { apply("theme", themeBtn.getAttribute("data-ads-theme")); return; }
    var accentBtn = t.closest("[data-ads-accent]"); if (accentBtn) { apply("accent", accentBtn.getAttribute("data-ads-accent")); return; }
    var densBtn = t.closest("[data-ads-density]"); if (densBtn) { apply("density", densBtn.getAttribute("data-ads-density")); return; }

    var opener = t.closest("[data-ads-open]"); if (opener) { e.preventDefault(); openOverlay(opener.getAttribute("data-ads-open"), opener); return; }
    var closer = t.closest("[data-ads-close]"); if (closer) { closeOverlay(closer.closest(".ads-scrim")); return; }
    if (t.classList && t.classList.contains("ads-scrim")) { closeOverlay(t); return; }  // backdrop click

    var toastBtn = t.closest("[data-ads-toast]"); if (toastBtn) { toast(toastBtn.getAttribute("data-ads-toast") || "저장했습니다.", toastBtn.getAttribute("data-ads-toast-kind")); return; }

    var tab = t.closest(".ads-tab"); if (tab && tab.closest(".ads-tabs")) { activateTab(tab); return; }
    var sw = t.closest(".ads-switch"); if (sw) { sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true")); return; }
    var treeTog = t.closest(".ads-tree-toggle"); if (treeTog) { toggleTree(treeTog); return; }

    var menuItem = t.closest(".ads-menu-item,.ads-combo-opt,.ads-cal-day,.ads-cmdk-item"); // choose then close popper/overlay
    if (menuItem) {
      handleChoice(menuItem);
      var wrap = menuItem.closest(POP_WRAP); if (wrap) closeAllPoppers(null);
      return;
    }

    var wrap2 = t.closest(POP_WRAP);
    if (wrap2) { var panel = wrap2.querySelector(POP_PANEL); if (!(panel && panel.contains(t))) { togglePopper(wrap2); return; } return; }

    closeAllPoppers(null); // click on empty space
  });

  function activateTab(tab) {
    var list = tab.closest(".ads-tabs");
    list.querySelectorAll(".ads-tab").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
    tab.classList.add("is-active"); tab.setAttribute("aria-selected", "true");
  }
  function toggleTree(tog) {
    var item = tog.closest('[role="treeitem"]');
    var group = item && item.querySelector('[role="group"]');
    var open = item.getAttribute("aria-expanded") !== "false";
    item.setAttribute("aria-expanded", String(!open));
    if (group) group.hidden = open;
    tog.textContent = open ? "▸" : "▾";  // ▸ / ▾
  }
  function handleChoice(item) {
    if (item.classList.contains("ads-combo-opt")) {
      var list = item.parentElement;
      list.querySelectorAll(".ads-combo-opt").forEach(function (o) { o.classList.remove("is-selected"); o.setAttribute("aria-selected", "false"); });
      item.classList.add("is-selected"); item.setAttribute("aria-selected", "true");
    } else if (item.classList.contains("ads-cal-day")) {
      var grid = item.closest(".ads-cal-grid");
      if (grid) grid.querySelectorAll(".ads-cal-day").forEach(function (d) { d.classList.remove("is-selected"); });
      item.classList.add("is-selected");
    } else if (item.classList.contains("ads-cmdk-item") || item.classList.contains("ads-menu-item")) {
      var scrim = item.closest(".ads-scrim"); if (scrim) closeOverlay(scrim);
    }
  }

  /* tree keyboard navigation (roving focus + expand/collapse) */
  function treeVisibleRows(tree) {
    return Array.prototype.slice.call(tree.querySelectorAll(".ads-tree-row")).filter(function (r) {
      var g = r.parentElement && r.parentElement.closest('[role="group"]');
      while (g) { if (g.hidden) return false; g = g.parentElement && g.parentElement.closest('[role="group"]'); }
      return true;
    });
  }
  function focusTreeRow(tree, row) {
    if (!row) return;
    tree.querySelectorAll(".ads-tree-row").forEach(function (r) { r.tabIndex = -1; });
    row.tabIndex = 0; row.focus();
  }
  function handleTreeKey(e, row) {
    var tree = row.closest(".ads-tree");
    var item = row.closest('[role="treeitem"]');
    var rows = treeVisibleRows(tree);
    var idx = rows.indexOf(row);
    var tog = row.querySelector(".ads-tree-toggle");
    var expanded = item.getAttribute("aria-expanded");
    e.preventDefault();
    if (e.key === "ArrowDown") focusTreeRow(tree, rows[idx + 1]);
    else if (e.key === "ArrowUp") focusTreeRow(tree, rows[idx - 1]);
    else if (e.key === "Home") focusTreeRow(tree, rows[0]);
    else if (e.key === "End") focusTreeRow(tree, rows[rows.length - 1]);
    else if (e.key === "ArrowRight") {
      if (expanded === "false" && tog) toggleTree(tog);
      else if (expanded === "true") { var child = item.querySelector('[role="group"] .ads-tree-row'); if (child) focusTreeRow(tree, child); }
    } else if (e.key === "ArrowLeft") {
      if (expanded === "true" && tog) toggleTree(tog);
      else { var parent = item.parentElement.closest('[role="treeitem"]'); if (parent) focusTreeRow(tree, parent.querySelector(".ads-tree-row")); }
    } else if (e.key === "Enter" || e.key === " ") {
      if (tog) toggleTree(tog);
      else { tree.querySelectorAll('.ads-tree-row[aria-current]').forEach(function (r) { r.removeAttribute("aria-current"); }); row.setAttribute("aria-current", "true"); }
    }
  }

  /* ---- 6. Keyboard: Esc, Space on switch, ⌘/Ctrl+K, cmdk arrows --- */
  document.addEventListener("keydown", function (e) {
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      var cmdk = document.getElementById("ads-cmdk");
      if (cmdk && cmdk.classList.contains("is-open")) closeOverlay(cmdk); else openOverlay("ads-cmdk", document.activeElement);
      return;
    }
    // focus trap: keep Tab within the open overlay (honors aria-modal)
    var trap = topOverlay();
    if (trap && e.key === "Tab") {
      var tdlg = trap.querySelector('[role="dialog"]') || trap;
      var ff = focusables(tdlg);
      if (ff.length) {
        var f0 = ff[0], fN = ff[ff.length - 1];
        if (!tdlg.contains(document.activeElement)) { e.preventDefault(); f0.focus(); }
        else if (e.shiftKey && document.activeElement === f0) { e.preventDefault(); fN.focus(); }
        else if (!e.shiftKey && document.activeElement === fN) { e.preventDefault(); f0.focus(); }
      }
    }
    if (e.key === "Escape") {
      var ov = topOverlay();
      if (ov) { closeOverlay(ov); return; }
      closeAllPoppers(null);
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      var sw = e.target.closest && e.target.closest(".ads-switch");
      if (sw) { e.preventDefault(); sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true")); return; }
    }
    // command palette: arrow to move highlight, Enter to run (keyboard-only complete)
    var cmdkOpen = document.querySelector("#ads-cmdk.is-open");
    if (cmdkOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      var cinput = cmdkOpen.querySelector(".ads-cmdk-input");
      var citems = Array.prototype.slice.call(cmdkOpen.querySelectorAll(".ads-cmdk-item:not([hidden])"));
      if (!citems.length) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleChoice(cmdkOpen.querySelector(".ads-cmdk-item.is-active:not([hidden])") || citems[0]);
        return;
      }
      e.preventDefault();
      var ci = citems.findIndex(function (x) { return x.classList.contains("is-active"); });
      citems.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      ci = e.key === "ArrowDown" ? Math.min(citems.length - 1, ci + 1) : Math.max(0, ci < 0 ? 0 : ci - 1);
      var cact = citems[ci];
      cact.classList.add("is-active"); cact.setAttribute("aria-selected", "true"); cact.scrollIntoView({ block: "nearest" });
      if (cinput && cact.id) cinput.setAttribute("aria-activedescendant", cact.id);
      return;
    }

    // combobox options: arrow to move highlight, Enter to select
    var comboPop = document.querySelector(".ads-combobox .ads-combo-pop:not([hidden])");
    if (comboPop && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      var oopts = Array.prototype.slice.call(comboPop.querySelectorAll(".ads-combo-opt:not([hidden])"));
      if (!oopts.length) return;
      var search = comboPop.querySelector(".ads-combo-search");
      var wrapC = comboPop.closest(POP_WRAP);
      if (e.key === "Enter") {
        e.preventDefault();
        handleChoice(comboPop.querySelector(".ads-combo-opt.is-active:not([hidden])") || oopts[0]);
        closeAllPoppers(null);
        var otrig = wrapC && wrapC.querySelector(".ads-combo-trigger"); if (otrig) otrig.focus();
        return;
      }
      e.preventDefault();
      var oi = oopts.findIndex(function (x) { return x.classList.contains("is-active"); });
      oopts.forEach(function (x) { x.classList.remove("is-active"); });
      oi = e.key === "ArrowDown" ? Math.min(oopts.length - 1, oi + 1) : Math.max(0, oi < 0 ? 0 : oi - 1);
      var oact = oopts[oi]; oact.classList.add("is-active"); oact.scrollIntoView({ block: "nearest" });
      if (search && oact.id) search.setAttribute("aria-activedescendant", oact.id);
      return;
    }

    // tree: roving focus + expand/collapse
    var treeRow = e.target.closest && e.target.closest(".ads-tree-row");
    if (treeRow && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "].indexOf(e.key) !== -1) {
      handleTreeKey(e, treeRow);
    }
  });

  /* ---- 7. Command-palette live filter ----------------------------- */
  document.addEventListener("input", function (e) {
    var input = e.target.closest(".ads-cmdk-input");
    if (!input) return;
    var q = input.value.trim().toLowerCase();
    var list = input.closest(".ads-cmdk").querySelector(".ads-cmdk-list");
    var any = false;
    list.querySelectorAll(".ads-cmdk-item").forEach(function (it) {
      var match = it.textContent.toLowerCase().indexOf(q) !== -1;
      it.hidden = !match; if (match) any = true;
    });
    var empty = list.querySelector(".ads-cmdk-empty");
    if (empty) empty.hidden = any;
    // keep exactly one highlighted visible result + sync aria-activedescendant
    list.querySelectorAll(".ads-cmdk-item").forEach(function (it) { it.classList.remove("is-active"); it.setAttribute("aria-selected", "false"); });
    var vis = list.querySelector(".ads-cmdk-item:not([hidden])");
    if (vis) { vis.classList.add("is-active"); vis.setAttribute("aria-selected", "true"); if (vis.id) input.setAttribute("aria-activedescendant", vis.id); }
    else input.removeAttribute("aria-activedescendant");
  });

  /* ---- 7b. Standalone indeterminate checkboxes (JS-only state) ---- */
  document.querySelectorAll(".ads-checkbox[data-ads-indeterminate]").forEach(function (cb) {
    cb.indeterminate = true;
    cb.addEventListener("change", function () { cb.indeterminate = false; });
  });

  /* ---- 7c. Tree roving tabindex (make one row focusable) ---------- */
  document.querySelectorAll(".ads-tree").forEach(function (tree) {
    var rows = Array.prototype.slice.call(tree.querySelectorAll(".ads-tree-row"));
    var current = tree.querySelector('.ads-tree-row[aria-current]') || rows[0];
    rows.forEach(function (r) { r.tabIndex = r === current ? 0 : -1; });
  });

  /* ---- 8. File dropzone drag state -------------------------------- */
  document.querySelectorAll(".ads-dropzone").forEach(function (dz) {
    ["dragenter", "dragover"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("is-dragover"); }); });
    ["dragleave", "drop"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("is-dragover"); }); });
  });

  /* ---- 9. Table "select all" with indeterminate ------------------- */
  document.querySelectorAll(".ads-table [data-ads-select-all]").forEach(function (master) {
    var table = master.closest("table");
    var boxes = function () { return Array.prototype.slice.call(table.querySelectorAll("tbody .ads-checkbox")); };
    master.addEventListener("change", function () {
      boxes().forEach(function (b) { b.checked = master.checked; b.closest("tr").classList.toggle("is-selected", master.checked); });
      master.indeterminate = false;
    });
    table.addEventListener("change", function (e) {
      if (!e.target.matches("tbody .ads-checkbox")) return;
      e.target.closest("tr").classList.toggle("is-selected", e.target.checked);
      var all = boxes(), on = all.filter(function (b) { return b.checked; }).length;
      master.checked = on === all.length; master.indeterminate = on > 0 && on < all.length;
    });
  });
})();
