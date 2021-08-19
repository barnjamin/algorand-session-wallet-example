import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import {SignedTxn} from 'algorand-session-wallet';


export type PopupProps = {
	isOpen: boolean
	result(s: string): void
}


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};



ReactModal.setAppElement('#root');
export function PopupPermissions(props: PopupProps){

	return (
		<div>
		  <ReactModal style={customStyles} isOpen={props.isOpen} contentLabel="Popup Permissions" >
		    <button onClick={()=>{props.result("decline")}}>Nevermind</button>
		    <button onClick={()=>{props.result("approve")}}>Proceed</button>
		  </ReactModal>
		</div>
	)
}
