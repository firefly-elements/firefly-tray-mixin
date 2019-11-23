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
          notify: true,
          observer: "onModelChange"
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
        },

        event: {
          type: String,
          value: "event"
        }
      };
    }

    /**
     * This methods gets called by 'card-selected' event listener
     * @param {Object} e - event
     */
    _handleCardSelected(e) {
      const pathname = window.location.pathname;
      const pattern = /\/\w+-?\w+/;
      const type = pathname.match(pattern)[0];

      if (type === "/indications") {
        this._handleNav(e, "/indication/" + e.detail.model.$key);
      } else if (type === "/advice") {
        this._handleNav(e, "/advice-details/" + e.detail.model.$key);
      } else {
        this._handleNav(e, "/therapeutics/" + e.detail.model.$key);
      }
    }

    /**
     * Use for one-time configuration of your component after local DOM is initialized.
     */
    ready() {
      super.ready();

      const pathname = window.location.pathname;
      const pattern = /\/\w+-?\w+/;
      const page = pathname.match(pattern)[0];

      if (page === "/communities") {
        this.event = "community";
      } else if (page === "/community-events") {
        this.event = "event";
      } else if (page === "/advice") {
        this.event = "advice";
      } else {
        this.event = "indication";
      }
    }

    /**
     * This methods gets called by 'card-added' event listener
     * @param {Object} e - event
     */
    _handleCardAdded(e) {
      
      let query = this.shadowRoot.querySelector("#query");
      let msg = "";
      try {
        query.ref.doc().set(e.detail.model, { merge: true });
        msg = `Added new ${this.event}`;
      } catch (error) {
        msg = `An error occurred while adding an ${this.event}`;
        console.log(error);
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
     * This methods gets called by 'card-deleted' event listener
     * @param {Object} e - event
     */
    _handleCardDeleted(e) {
      let query = this.shadowRoot.querySelector("#query");
      let msg = "";

      try {
        query.ref.doc(e.detail.model.$key).delete();
        msg = `Deleted ${this.event}: ${e.detail.model.name}`;
      } catch (error) {
        msg = "An error occurred while adding an indication";
        console.log(error);
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
     * This methods gets called by 'card-cloned' event listener
     * @param {Object} e - event
     */
    _handleCardCloned(e) {
      let clone = e.detail.model;
      delete clone.$key;

      let msg = "";
      try {
        let query = this.$.query;
        clone.name = clone.name + " Copy";
        query.ref.add(clone);
        msg = "Event cloned";
      } catch (ex) {
        console.error(ex);
        msg = "An error occurred while cloning the event.";
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
      let menu = this.shadowRoot.querySelector("asp-community-sheet");
      if (menu) {
        menu.close();
      }
      dialog.model = e.detail.model;
      dialog.open();
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("card-selected", e => this._handleCardSelected(e));
      this.addEventListener("card-added", e => {
       
        this._handleCardAdded(e)});
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
