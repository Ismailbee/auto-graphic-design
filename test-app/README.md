# 🎨 Canva-Style Editor – Fixes Needed
.

The main goal is to make the experience work **like Canva**:
- Users edit text **directly on the canvas**.
- The sidebar only controls **styling**, not typing.
- Objects (text, images, shapes) are fully interactive: **select, drag, resize, edit**.

---

## ❌ Current Problems
1. **Inline text editing not working** – Clicking text on the canvas does not allow typing/editing directly.
2. **Sidebar not syncing** – When I select a text object, the sidebar does not show the correct style properties.
3. **Images not showing** – When I add/upload an image, it does not render on the canvas.
4. **Resize not working** – I cannot resize objects with the mouse.
5. **Selection issues** – Clicking objects again does not re-select them for editing.

---

## ✅ Expected Behavior
- Clicking text on the canvas → text becomes **editable inline** (like Canva).
- Sidebar shows **style properties only** (font size, bold, italics, alignment, color, spacing, etc.), not text input.
- Images render correctly inside the canvas.
- Objects can be:
  - **Selected** (with highlight/border).
  - **Resized** with mouse handles.
  - **Dragged/moved** around the canvas.
- Sidebar always updates with the **currently selected object’s properties**.

---

## 🛠️ Tech Stack
- **Vue 3**
- **PrimeVue + TailwindCSS** for UI
- **Tiptap** → inline rich text editing directly on canvas
- **Fabric.js / Konva.js** → for canvas rendering & object manipulation

---

## 📌 Fixes Needed
- [ ] Add **inline editing** for text on the canvas (integrate Tiptap with Fabric.js/Konva).
- [ ] Fix **sidebar syncing** so it always updates with selected object’s styles.
- [ ] Debug **image rendering** (ensure uploaded images display properly).
- [ ] Enable **drag, resize, and scale** for objects with mouse.
- [ ] Ensure **object re-selection** works every time (selection box + handles).

---

## 🐞 Steps to Reproduce
1. Add text → try to edit on canvas → nothing happens.
2. Select text → sidebar does not update.
3. Add image → does not render.
4. Try resizing/moving → no effect.
5. Select again → cannot re-select object.

---

## 📖 Important Note
👉 The text editing experience should **mimic Canva**:
- Typing happens **on the canvas directly**.
- Sidebar only updates **style properties** (not actual text input).
