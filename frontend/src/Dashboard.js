import React, { Component } from "react";
import {
	Button,
	TextField,
	Dialog,
	DialogActions,
	LinearProgress,
	DialogTitle,
	DialogContent,
	TableBody,
	Table,
	TableContainer,
	TableHead,
	TableRow,
	TableCell,
} from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import swal from "sweetalert";
const axios = require("axios");

export default class Dashboard extends Component {
	constructor() {
		super();
		this.state = {
			token: "",
			openProductModal: false,
			openProductEditModal: false,
			id: "",
			name: "",
			desc: "",
			file: "",
			fileName: "",
			page: 1,
			search: "",
			products: [],
			pages: 0,
			loading: false,
		};
	}

	componentDidMount = () => {
		let token = localStorage.getItem("token");
		if (!token) {
			this.props.history.push("/login");
		} else {
			this.setState({ token: token }, () => {
				this.getProduct();
			});
		}
	};

	getProduct = () => {
		this.setState({ loading: true });

		let data = "?";
		data = `${data}page=${this.state.page}`;
		if (this.state.search) {
			data = `${data}&search=${this.state.search}`;
		}
		axios
			.get(`http://localhost:2000/get-product${data}`, {
				headers: {
					token: this.state.token,
				},
			})
			.then((res) => {
				this.setState({
					loading: false,
					products: res.data.products,
					pages: res.data.pages,
				});
			})
			.catch((err) => {
				swal({
					text: err.response.data.errorMessage,
					icon: "error",
					type: "error",
				});
				this.setState({ loading: false, products: [], pages: 0 }, () => {});
			});
	};

	deleteProduct = (id) => {
		axios
			.post(
				"http://localhost:2000/delete-product",
				{
					id: id,
				},
				{
					headers: {
						"Content-Type": "application/json",
						token: this.state.token,
					},
				},
			)
			.then((res) => {
				swal({
					text: res.data.title,
					icon: "success",
					type: "success",
				});

				this.setState({ page: 1 }, () => {
					this.pageChange(null, 1);
				});
			})
			.catch((err) => {
				swal({
					text: err.response.data.errorMessage,
					icon: "error",
					type: "error",
				});
			});
	};

	pageChange = (e, page) => {
		this.setState({ page: page }, () => {
			this.getProduct();
		});
	};

	logOut = () => {
		localStorage.setItem("token", null);
		this.props.history.push("/");
	};

	onChange = (e) => {
		if (e.target.files && e.target.files[0] && e.target.files[0].name) {
			this.setState({ fileName: e.target.files[0].name }, () => {});
		}
		this.setState({ [e.target.name]: e.target.value }, () => {});
		if (e.target.name == "search") {
			this.setState({ page: 1 }, () => {
				this.getProduct();
			});
		}
	};

	addProduct = () => {
		const fileInput = document.querySelector("#fileInput");
		const file = new FormData();
		file.append("file", fileInput.files[0]);
		file.append("name", this.state.name);
		file.append("desc", this.state.desc);

		axios
			.post("http://localhost:2000/add-product", file, {
				headers: {
					"content-type": "multipart/form-data",
					token: this.state.token,
				},
			})
			.then((res) => {
				swal({
					text: res.data.title,
					icon: "success",
					type: "success",
				});

				this.handleProductClose();
				this.setState({ name: "", desc: "", file: null, page: 1 }, () => {
					this.getProduct();
				});
			})
			.catch((err) => {
				swal({
					text: err.response.data.errorMessage,
					icon: "error",
					type: "error",
				});
				this.handleProductClose();
			});
	};

	updateProduct = () => {
		const fileInput = document.querySelector("#fileInput");
		const file = new FormData();
		file.append("id", this.state.id);
		file.append("file", fileInput.files[0]);
		file.append("name", this.state.name);
		file.append("desc", this.state.desc);

		axios
			.post("http://localhost:2000/update-product", file, {
				headers: {
					"content-type": "multipart/form-data",
					token: this.state.token,
				},
			})
			.then((res) => {
				swal({
					text: res.data.title,
					icon: "success",
					type: "success",
				});

				this.handleProductEditClose();
				this.setState({ name: "", desc: "", file: null }, () => {
					this.getProduct();
				});
			})
			.catch((err) => {
				swal({
					text: err.response.data.errorMessage,
					icon: "error",
					type: "error",
				});
				this.handleProductEditClose();
			});
	};

	handleProductOpen = () => {
		this.setState({
			openProductModal: true,
			id: "",
			name: "",
			desc: "",
			fileName: "",
		});
	};

	handleProductClose = () => {
		this.setState({ openProductModal: false });
	};

	handleProductEditOpen = (data) => {
		this.setState({
			openProductEditModal: true,
			id: data._id,
			name: data.name,
			desc: data.desc,
			fileName: data.image,
		});
	};

	handleProductEditClose = () => {
		this.setState({ openProductEditModal: false });
	};

	render() {
		return (
			<div>
				{this.state.loading && <LinearProgress size={40} />}
				<div>
					<h2>Dashboard</h2>
					<Button
						className="button_style"
						variant="contained"
						color="primary"
						size="small"
						onClick={this.handleProductOpen}
					>
						Add Document
					</Button>
					<Button
						className="button_style"
						variant="contained"
						color="secondary"
						size="small"
						onClick={this.logOut}
					>
						Log Out
					</Button>
				</div>

				<Dialog
					open={this.state.openProductEditModal}
					onClose={this.handleProductClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">Edit Document</DialogTitle>
					<DialogContent>
						<TextField
							id="standard-basic"
							type="text"
							autoComplete="off"
							name="name"
							value={this.state.name}
							onChange={this.onChange}
							placeholder="Document Name"
							required
						/>
						<br />
						<TextField
							id="standard-basic"
							type="text"
							autoComplete="off"
							name="desc"
							value={this.state.desc}
							onChange={this.onChange}
							placeholder="Description"
							required
						/>
						<br />
						<Button variant="contained" component="label">
							{" "}
							Upload
							<input
								id="standard-basic"
								type="file"
								accept="image/*"
								name="file"
								value={this.state.file}
								onChange={this.onChange}
								id="fileInput"
								placeholder="File"
								hidden
							/>
						</Button>
						&nbsp;
						{this.state.fileName}
					</DialogContent>

					<DialogActions>
						<Button onClick={this.handleProductEditClose} color="primary">
							Cancel
						</Button>
						<Button
							disabled={this.state.name == "" || this.state.desc == ""}
							onClick={(e) => this.updateProduct()}
							color="primary"
							autoFocus
						>
							Edit Product
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={this.state.openProductModal}
					onClose={this.handleProductClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">Add Document</DialogTitle>
					<DialogContent>
						<TextField
							id="standard-basic"
							type="text"
							autoComplete="off"
							name="name"
							value={this.state.name}
							onChange={this.onChange}
							placeholder="Document Name"
							required
						/>
						<br />
						<TextField
							id="standard-basic"
							type="text"
							autoComplete="off"
							name="desc"
							value={this.state.desc}
							onChange={this.onChange}
							placeholder="Description"
							required
						/>
						<br />
						<br />
						<Button variant="contained" component="label">
							{" "}
							Upload
							<input
								id="standard-basic"
								type="file"
								accept="image/*"
								name="file"
								value={this.state.file}
								onChange={this.onChange}
								id="fileInput"
								placeholder="File"
								hidden
								required
							/>
						</Button>
						&nbsp;
						{this.state.fileName}
					</DialogContent>

					<DialogActions>
						<Button onClick={this.handleProductClose} color="primary">
							Cancel
						</Button>
						<Button
							disabled={
								this.state.name == "" ||
								this.state.desc == "" ||
								this.state.file == null
							}
							onClick={(e) => this.addProduct()}
							color="primary"
							autoFocus
						>
							Add Document
						</Button>
					</DialogActions>
				</Dialog>

				<br />

				<TableContainer>
					<TextField
						id="standard-basic"
						type="search"
						autoComplete="off"
						name="search"
						value={this.state.search}
						onChange={this.onChange}
						placeholder="Search"
						required
					/>
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell align="center">Name</TableCell>
								<TableCell align="center">Image</TableCell>
								<TableCell align="center">Description</TableCell>
								<TableCell align="center">Action</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.products.map((row) => (
								<TableRow key={row.name}>
									<TableCell align="center" component="th" scope="row">
										{row.name}
									</TableCell>
									<TableCell align="center">
										<img
											src={`http://localhost:2000/${row.image}`}
											width="70"
											height="70"
										/>
									</TableCell>
									<TableCell align="center">{row.desc}</TableCell>

									<TableCell align="center">
										<Button
											className="button_style"
											variant="outlined"
											color="primary"
											size="small"
											onClick={(e) => this.handleProductEditOpen(row)}
										>
											Edit
										</Button>
										<Button
											className="button_style"
											variant="outlined"
											color="secondary"
											size="small"
											onClick={(e) => this.deleteProduct(row._id)}
										>
											Delete
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<br />
					<Pagination
						count={this.state.pages}
						page={this.state.page}
						onChange={this.pageChange}
						color="primary"
					/>
				</TableContainer>
			</div>
		);
	}
}
