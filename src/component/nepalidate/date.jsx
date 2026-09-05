import React, { useEffect, useRef } from "react";

import "@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.js";
import "@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.css";

function NepaliDatepicker({
  options = {},
  onSelect = () => {},
  id,
  className = "",
  defaultValue = "",
  placeholder = "",
}) {
  const inputRef = useRef(null);
  const initializedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const optionsRef = useRef(options);

  onSelectRef.current = onSelect;
  optionsRef.current = options;

  useEffect(() => {
    const input = inputRef.current;

    if (!input) return;

    let pickerBox = null;
    let observer = null;

    const getPickerBox = () => {
      return document.getElementById("ndp-nepali-box");
    };

    const positionPicker = () => {
      const inputElement = inputRef.current;
      const box = getPickerBox();

      if (!inputElement || !box) return;

      const isHidden =
        box.style.display === "none" ||
        window.getComputedStyle(box).display === "none";

      if (isHidden) return;

      const rect = inputElement.getBoundingClientRect();

      const pickerWidth = box.offsetWidth || 266;
      const pickerHeight = box.offsetHeight || 350;

      let left = rect.left;

      // Prevent horizontal overflow
      if (left + pickerWidth > window.innerWidth - 8) {
        left = window.innerWidth - pickerWidth - 8;
      }

      left = Math.max(8, left);

      // Default: below input
      let top = rect.bottom + 4;

      // If there isn't enough space below,
      // show the picker above the input.
      if (top + pickerHeight > window.innerHeight - 8) {
        top = rect.top - pickerHeight - 4;
      }

      top = Math.max(8, top);

      box.style.setProperty("position", "fixed", "important");
      box.style.setProperty("top", `${top}px`, "important");
      box.style.setProperty("left", `${left}px`, "important");
      box.style.setProperty("z-index", "99999", "important");
    };

    const watchPicker = () => {
      // Position immediately
      positionPicker();

      // Library usually updates the picker
      // after the focus event.
      requestAnimationFrame(positionPicker);

      setTimeout(positionPicker, 0);
      setTimeout(positionPicker, 50);
      setTimeout(positionPicker, 100);
      setTimeout(positionPicker, 200);
    };

    const getTodayBsDate = () => {
      if (!window.NepaliFunctions) return "";

      const bsDate =
        window.NepaliFunctions.GetCurrentBsDate?.();

      if (!bsDate) return "";

      return `${bsDate.year}-${String(bsDate.month).padStart(
        2,
        "0"
      )}-${String(bsDate.day).padStart(2, "0")}`;
    };

    const normalizeValue = (value) => {
      if (!value) return "";

      if (typeof value === "string") {
        return value;
      }

      if (typeof value === "object" && value !== null) {
        return (
          value.formattedDate ||
          value.bsDate ||
          value.value ||
          value.adDate ||
          Object.values(value)[0] ||
          ""
        );
      }

      return "";
    };

    const initializePicker = () => {
      if (!inputRef.current || initializedRef.current) return;

      const todayStr = getTodayBsDate();

      const pickerOptions = {
        disableBefore: todayStr,

        ...optionsRef.current,

        onSelect: (value) => {
          const currentOptions = optionsRef.current;

          if (currentOptions.range) {
            const finalValue = normalizeValue(value);

            // Make sure the visible input also contains
            // the selected range.
            if (inputRef.current) {
              inputRef.current.value = finalValue;
            }

            onSelectRef.current(finalValue);
            watchPicker();

            return;
          }

          const finalDateString = normalizeValue(value);

          if (inputRef.current) {
            inputRef.current.value = finalDateString;
          }

          onSelectRef.current(finalDateString);

          watchPicker();
        },
      };

      inputRef.current.NepaliDatePicker(pickerOptions);

      initializedRef.current = true;

      /*
       * IMPORTANT:
       * Restore API value AFTER plugin initialization.
       */
      if (defaultValue) {
        inputRef.current.value = defaultValue;
      }

      /*
       * The plugin creates #ndp-nepali-box dynamically.
       */
      pickerBox = getPickerBox();

      if (pickerBox) {
        positionPicker();
      }

      /*
       * Watch for the plugin changing:
       * display / position / style.
       */
      observer = new MutationObserver(() => {
        const box = getPickerBox();

        if (!box) return;

        positionPicker();
      });

      if (pickerBox) {
        observer.observe(pickerBox, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
      }

      /*
       * The picker may not exist immediately,
       * so check for it shortly after initialization.
       */
      setTimeout(() => {
        pickerBox = getPickerBox();

        if (pickerBox) {
          positionPicker();

          observer?.observe(pickerBox, {
            attributes: true,
            attributeFilter: ["style", "class"],
          });
        }
      }, 100);
    };

    initializePicker();

    input.addEventListener("focus", watchPicker);
    input.addEventListener("click", watchPicker);

    window.addEventListener("resize", positionPicker);
    window.addEventListener("scroll", positionPicker, true);

    /*
     * Reposition while the browser is rendering.
     */
    const interval = setInterval(() => {
      const box = getPickerBox();

      if (
        box &&
        window.getComputedStyle(box).display !== "none"
      ) {
        positionPicker();
      }
    }, 150);

    return () => {
      initializedRef.current = false;

      input.removeEventListener("focus", watchPicker);
      input.removeEventListener("click", watchPicker);

      window.removeEventListener("resize", positionPicker);
      window.removeEventListener(
        "scroll",
        positionPicker,
        true
      );

      observer?.disconnect();
      clearInterval(interval);

      const box = getPickerBox();

      if (box) {
        box.style.display = "none";
      }
    };
  }, []);

  /*
   * IMPORTANT:
   * If API defaultValue arrives AFTER the component has mounted,
   * update the actual input value.
   */
  useEffect(() => {
    if (!inputRef.current) return;

    if (defaultValue !== undefined && defaultValue !== null) {
      inputRef.current.value = defaultValue;
    }
  }, [defaultValue]);

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      placeholder={placeholder}
      autoComplete="off"
      className={`
        w-full rounded-md border
        border-slate-300
        bg-white/30
        p-3
        text-[15px]
        text-black
        backdrop-blur-md
        transition-all
        focus:border-[#c49d52]
        focus:bg-white/5
        focus:outline-none
        focus:ring-1
        focus:ring-[#c49d52]
        ${className}
      `}
    />
  );
}

export default NepaliDatepicker;