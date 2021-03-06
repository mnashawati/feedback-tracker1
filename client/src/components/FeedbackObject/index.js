/* eslint-disable jsx-a11y/no-onchange */
import React, { useState, useEffect, useContext } from "react";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import modules from "../../db/modules.json";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import timeDifference from "../../helperFunctions/timeDifference";
import { AuthContext } from "../../authentication/Auth";

const FeedbackObject = ({ feedbackToShow, student, updateFeedback }) => {

	const [isEditing, setIsEditing] = useState(false);
	const [currentFeedback, setCurrentFeedback] = useState({});
	const [showModal, setShowModal] = useState(false);

	const { currentUser } = useContext(AuthContext);
	const mentorsEmail = currentUser.email;

	useEffect(() => {
		setCurrentFeedback(feedbackToShow);
	}, [feedbackToShow]);

	//POST updated feedback to DB
	//When clicked SAVE; UPDATE the data
	const updateData = (id) => {
		fetch(`/api/students/${student._id}/feedback/${id}`, {
			method: "PUT",
			headers: { "Content-type": "application/json" },
			body: JSON.stringify(currentFeedback),
		})
			.then((res) => res.json())
			.catch((error) => console.log(error));
	};

	//When clicked SAVE, CHECK if field is empty
	const saveFeedback = (id) => {
		if (!currentFeedback.title) {
			return alert("Please add a title");
		} else if (!currentFeedback.text) {
			return alert("Please add your feedback");
		} else if (!currentFeedback.mentor) {
			return alert("Please add your name");
		}
		updateData(id);
	};

	//DELETE selected feedback and update data
	const handleDelete = (feedbackId) => {
		fetch(`/api/students/${student._id}/${feedbackId}`, {
			method: "DELETE",
			headers: { "Content-type": "application/json" },
		})
			.then((res) => res.json()).then()
			.catch((error) => console.log(error))
			.then(() => updateFeedback());
	};

	// Populate new object with edited data editable
	const handleEdit = (e) => {
		setCurrentFeedback({ ...currentFeedback, [e.target.name]: e.target.value });
	};

	const handleCancel = () => {
		setCurrentFeedback(feedbackToShow);
		setIsEditing(!isEditing);
	};

	return (
		currentFeedback && (
			<div className="prev-feedback-list">
				<div className="feedback-title-and-module">
					<div className="feedback-title">
						<input
							className="prev-feedback-title-input"
							name={"title"}
							value={currentFeedback.title || ""}
							onChange={handleEdit}
							disabled={!isEditing}
						/>
					</div>
					<div className="feedback-module">
						{!isEditing ? (
							<p className="module-select-p">{`Module: ${currentFeedback.module}`}</p>
						) : (
							<>
								<p className="feedback-input-heading">Module:</p>
								<select
									className="module-select"
									name={"module"}
									value={currentFeedback.module || ""}
									onChange={handleEdit}
								>
									{modules.map((module, index) => (
										<option key={index} value={module.name}>
											{module.name}
										</option>
									))}
								</select>
							</>
						)}
					</div>
				</div>
				<div className="previous-feedback-text">
					<textarea
						className="feedback-text-textarea"
						name={"text"}
						value={currentFeedback.text || ""}
						onChange={handleEdit}
						disabled={!isEditing}
					/>
				</div>
				<div className="feedback-mentor-time-buttons">
					<div className="feedback-mentor-and-time">
						<div className="prev-feedback-mentor">
							<input
								className="prev-feedback-mentor-input"
								name={"mentor"}
								value={`Given by: ${currentFeedback.mentor || ""}`}
								onChange={handleEdit}
								disabled
							/>
						</div>
						<div className="prev-feedback-time">
							<p className="prev-feedback-time-input">
								{timeDifference(Date.now(), currentFeedback.time)}
							</p>
						</div>
					</div>
					{ mentorsEmail === currentFeedback.mentorEmail ? (
						<div className="edit-delete-buttons">
							<Button
								variant="success"
								onClick={() => {
									setIsEditing(!isEditing);
									isEditing && saveFeedback(currentFeedback.id);
								}}
								className="edit-save-feedback-btn">
								{!isEditing ? "Edit" : "Update"}</Button>

							{isEditing ? (
								<Button variant="outline-danger" onClick={handleCancel}
									className="cancel-edit-feedback-btn">Cancel</Button>
							) : (
								<>
									<Button variant="danger" onClick={()=>{
										setShowModal(true);
									}}
									className="delete-feedback-btn">
				              			Delete
									</Button>
									<Modal show={showModal} onHide={()=>{
										setShowModal(false);
									}}>
										<Modal.Header closeButton>
											<Modal.Title>Delete feedback?</Modal.Title>
										</Modal.Header>
										<Modal.Footer>
											<Button variant="secondary" onClick={()=>{
												setShowModal(false);
											}}
											className="cancel-delete-feedback-btn">
						              			Cancel
											</Button>
											<Button variant="danger" onClick={() => {
												handleDelete(currentFeedback.id);
												setShowModal(false);
											}}
											className="confirm-delete-feedback-btn">
						              			Delete
											</Button>
										</Modal.Footer>
									</Modal>
								</>
							)}
						</div> ) : null}
				</div>
			</div>
		)
	);
};

FeedbackObject.propTypes = {
	student: PropTypes.object.isRequired,
	feedbackToShow: PropTypes.object.isRequired,
	updateFeedback: PropTypes.func.isRequired,
};

export default FeedbackObject;
