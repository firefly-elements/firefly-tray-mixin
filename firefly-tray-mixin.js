import { matchesSelector } from "@polymer/polymer/lib/legacy/polymer.dom.js";
import { FlattenedNodesObserver } from "@polymer/polymer/lib/utils/flattened-nodes-observer.js";

/**
 * This mixin is used by trays of cards whose data models are driven by a firebase
 * database.
 * @polymerMixin
 * @mixinFunction
 */
export const FireflyTrayMixin = superclass =>
  class extends superclass {
    static get properties() {
      return {
        /** The model for the tray, containing an array of objects. */
        model: {
          type: Array,
          value: [],
          notify: true
        },

        /** The text of the dialog header. */
        dialogLabel: {
          type: String,
          value: ""
        },

        /** A flag that indicates that the paper-fab is small. */
        fabIsMini: {
          type: Boolean,
          value: false
        },

        data: {
          type: Object,
          observer: "onDataChange"
        }
      };
    }

    /** @Overide */
    _handleCardSelected(e) {
      const type = window.location.pathname;
      if (type === "/settings-indications") {
        this._handleNav(e, "/indications/" + e.detail.model.$key);
      } else {
        this._handleNav(e, "/therapeutics/" + e.detail.model.$key);
      }
    }

    /** @Override */
    _handleCardAdded(e) {
      let query = this.shadowRoot.querySelector("#query");
      let msg = "";

      try {
        query.ref.doc().set(e.detail.model, { merge: true });
        msg = "Added new indication";
      } catch (e) {
        msg = "An error occurred while adding an indication";
        console.log(e);
      }
      this.dispatchEvent(
        new CustomEvent("show-msg", {
          bubbles: true,
          composed: true,
          detail: {
            msg: msg
          }
        })
      );
    }

    /**
     * @Override
     */
    _handleCardDeleted(e) {
      let query = this.shadowRoot.querySelector("#query");
      let msg = "";
      try {
        query.ref.doc(e.detail.model.$key).delete();
        msg = "Deleted indication: " + e.detail.model.name;
      } catch (e) {
        msg = "An error occurred while adding an indication";
        console.log(e);
      }
      this.dispatchEvent(
        new CustomEvent("show-msg", {
          bubbles: true,
          composed: true,
          detail: {
            msg: msg
          }
        })
      );
    }

    /**
     * This method is called by _handleCardSelected, and opens a new window
     * if the user is holding down the meta key while pressing the detail button.
     * @param e the event
     * @param uri the URI to navigate to.
     */

    _handleNav(e, uri) {
      e.stopPropagation();
      console.log(e);
      if (!e.detail.metaKey) {
        window.location = uri;
      } else {
        window.open(uri, "_blank");
      }
    }

    /**
     * This method is responsible for displaying a dialog used to determine
     * if the user really wants to delete a record.
     * @param e the event.
     */

    _requestCardDeleted(e) {
      e.stopPropagation();
      const dialog = this.shadowRoot.querySelector("firefly-delete-dialog");
      dialog.model = e.detail.model;
      dialog.open();
    }

    _openAddDialog(e) {
      let nodes = FlattenedNodesObserver.getFlattenedNodes(this);
      let assignedNodes = nodes.filter(
        n =>
          n.nodeType === Node.ELEMENT_NODE &&
          matchesSelector(n, ".detail-dialog")
      );
      let dialog = assignedNodes[0];
      console.log(dialog);
      dialog.newOpen();
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("card-selected", e => this._handleCardSelected(e));
      this.addEventListener("card-added", e => this._handleCardAdded(e));
      this.addEventListener("request-card-deleted", e => {
        this._requestCardDeleted(e);
      });
      this.addEventListener("card-deleted", e => {
        this._handleCardDeleted(e);
      });
      this.addEventListener("card-cloned", e => this._handleCardCloned(e));
      this.addEventListener("card-launched", e => this._handleCardLaunched(e));
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("card-selected", e =>
        this._handleCardSelected(e)
      );
      this.removeEventListener("card-added", e => this._handleCardAdded(e));
      this.removeEventListener("request-card-deleted", e =>
        this._requestCardDeleted(e)
      );
      this.removeEventListener("card-deleted", e => this._handleCardDeleted(e));
      this.removeEventListener("card-launched", e =>
        this._handleCardLaunched()
      );
    }
  };
