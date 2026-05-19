/**
 * Indian states and union territories for admission / address forms.
 */
(function (global) {
  var STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  var UNION_TERRITORIES = [
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  function populateStateSelect(selectEl, opts) {
    if (!selectEl) return;
    opts = opts || {};
    var keepValue = opts.keepValue && selectEl.value;

    selectEl.innerHTML = "";

    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = !keepValue;
    placeholder.textContent = opts.placeholder || "Select state / union territory";
    selectEl.appendChild(placeholder);

    function addGroup(label, items) {
      var group = document.createElement("optgroup");
      group.label = label;
      items.forEach(function (name) {
        var opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        group.appendChild(opt);
      });
      selectEl.appendChild(group);
    }

    addGroup("States", STATES);
    addGroup("Union Territories", UNION_TERRITORIES);

    if (keepValue) {
      var exists = false;
      for (var i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === keepValue) {
          exists = true;
          break;
        }
      }
      if (exists) {
        selectEl.value = keepValue;
        placeholder.selected = false;
      }
    }
  }

  function initAdmissionStateSelect() {
    populateStateSelect(document.getElementById("state"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmissionStateSelect);
  } else {
    initAdmissionStateSelect();
  }

  global.CMSIndianStates = {
    STATES: STATES,
    UNION_TERRITORIES: UNION_TERRITORIES,
    populateStateSelect: populateStateSelect,
  };
})(typeof window !== "undefined" ? window : this);
