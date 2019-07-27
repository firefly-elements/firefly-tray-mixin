import { matchesSelector } from './node_modules/@polymer/polymer/lib/legacy/polymer.dom.js';
import { FlattenedNodesObserver } from './node_modules/@polymer/polymer/lib/utils/flattened-nodes-observer.js';

/**
 * This mixin is used by trays of cards whose data models are driven by a firebase
 * database.
 * @polymerMixin
 * @mixinFunction
 */
const AspFireTrayMixin = (superclass) => class extends superclass {


		static get properties(){
        return {

            /** The model for the tray, containing an array of objects. */
            model:{
                type: Array,
                value: [],
                notify: true
            },

            /** The text of the dialog header. */
            dialogLabel:{
                type: String,
                value: ''
            },

            /** A flag that indicates that the paper-fab is small. */
            fabIsMini:{
                type: Boolean,
                value: false
            }
        }
		}

		/**
		 * This method is used whenever the card is selected. The tray's 
		 * implemention of this method navigate the user to the detail page
		 * for the record.
		 * @param e the event
		 */
		 _handleCardSelected(e){}

		/**
		 * This method is called by _handleCardSelected, and opens a new window
		 * if the user is holding down the meta key while pressing the detail button.
		 * @param e the event
		 * @param uri the URI to navigate to.
		 */ 
		 _handleNav(e, uri){
        e.stopPropagation();
        console.log(e);
        if(!e.detail.metaKey){
            window.location = uri;
        }else{
            window.open(uri, '_blank');
        }
		 }

		/**
		 * This method is responsible for displaying a dialog used to determine
		 * if the user really wants to delete a record.
		 * @param e the event.
		 */ 
		 _requestCardDeleted(e){
        e.stopPropagation();
        const dialog = this.shadowRoot.querySelector("asp-delete-dialog");
        dialog.model = e.detail.model;
        dialog.open();
        
		 }

		/**
		 * This method is used whenever the card is deleted. The tray's implemention
		 * of this method should, display a dialog box using the _requestCardDeleted method 
		 * to determine if the user really wants to delete
		 * the record, and then delete the record from the database.
		 * @param e the event
		 */ 
		_handleCardDeleted(e){}


		/**
		 * This method is used to add a new record to the database. This method
		 * should be triggered by the fab, and should display a dialog that
		 * allows the user to add a new record to the database.
		 * @param e the event
		 */ 
		_handleCardAdded(e){}

		/** 
		 * This method is used to clone a record. 
		 * @param e the event
		 */ 
		_handleCardCloned(e){}

		/**
		 * This method is used to open an external page specified by the card. For example, you
		 * may have an article record where you want to open PubMed in a new window.
		 */ 
		_handleCardLaunched(e){}

		/**
		 * Implementations of this method should open a dialog used to add a record
		 * to the database, and should clear all of the fields of the dialog. The dialog
		 * should implement the AspFireDialogMixin.
		 * @param {Event} e the event
		 */ 
		_openAddDialog(e){
        let nodes = FlattenedNodesObserver.getFlattenedNodes(this);
        let assignedNodes = nodes.filter( n => n.nodeType === Node.ELEMENT_NODE && matchesSelector(n, '.detail-dialog'));
        let dialog = assignedNodes[0];
        console.log(dialog);
        dialog.newOpen();
		}

		connectedCallback(){
        super.connectedCallback();
        this.addEventListener('card-selected', e => this._handleCardSelected(e));
        this.addEventListener('card-added', e => this._handleCardAdded(e));
        this.addEventListener('request-card-deleted', e => this._requestCardDeleted(e));
        this.addEventListener('card-deleted', e => this._handleCardDeleted(e));
        this.addEventListener('card-cloned', e => this._handleCardCloned(e));
        this.addEventListener('card-launched', e => this._handleCardLaunched(e));
		}

		disconnectedCallback(){
        super.disconnectedCallback();
        this.removeEventListener('card-selected', e => this._handleCardSelected(e));
        this.removeEventListener('card-added', e => this._handleCardAdded(e));
        this.removeEventListener('request-card-deleted', e => this._requestCardDeleted(e));
        this.removeEventListener('card-deleted', e => this._handleCardDeleted(e));
        this.removeEventListener('card-launched', e => this._handleCardLaunched());
		}
		
}
