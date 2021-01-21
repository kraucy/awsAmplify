import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import {
	Button,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemAvatar,
	ListItemSecondaryAction,
	ListItemText,
	IconButton,
	TextField,
} from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { listTodos } from './graphql/queries';
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations';
import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

const initialState = { name: '', description: '' };

const styles = {
	container: {
		width: 500,
		margin: '0 auto',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		padding: 15,
	},
	todo: {
		padding: 15,
	},
	input: {
		marginBottom: 15, padding: 8, fontSize: 18,
	},
	item: {
		borderBottom: '1px solid gray',
	},
	todoName: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	todoDescription: {
		marginBottom: 0,
	},
	button: {
		fontSize: 18, padding: '15px 0px',
	},
};

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(1),
			height: theme.spacing(5),
		},
	},
	paper: {
		marginBottom: 15,
	},
}));

const App = () => {
	const [editing, setEditState] = useState(false);
	const [formState, setFormState] = useState(initialState);
	const [todos, setTodos] = useState([]);
	const classes = useStyles();

	function setInput(key, value) {
		setFormState({ ...formState, [key]: value });
	}

	async function fetchTodos() {
		try {
			const todoData = await API.graphql(graphqlOperation(listTodos));
			const listOfTodos = todoData.data.listTodos.items;
			setTodos(listOfTodos);
		} catch (err) {
			console.log('error fetching todos');
		}
	}

	async function addTodo() {
		try {
			if (!formState.name || !formState.description) return;
			const todo = { ...formState };
			setTodos([...todos, todo]);
			setFormState(initialState);
			await API.graphql(graphqlOperation(createTodo, { input: todo }));
		} catch (err) {
			console.log('error creating todo:', err);
		}
	}

	async function updateThisTodo(todo) {
		setEditState(true);
		setFormState({
			id: todo.id,
			name: todo.name,
			description: todo.description,
		});
	}

	async function saveTodo() {
		console.log(formState);
		try {
			await API.graphql(graphqlOperation(updateTodo, { input: formState }));
			fetchTodos();
			setFormState(initialState);
			setEditState(false);
		} catch (err) {
			console.log('error updating todo:', err);
		}
	}

	async function removeTodo(todo) {
		const todoId = {
			id: todo.id,
		};
		try {
			await API.graphql(graphqlOperation(deleteTodo, { input: todoId }));
			setFormState(initialState);
			fetchTodos();
			alert('todo deleted!');
		} catch (err) {
			console.log('error deleting todo:', err);
		}
	}

	useEffect(() => {
		fetchTodos();
	}, []);

	return (
		<div className="App">
			<Card style={styles.container}>
				<CardContent>
					<form className={classes.root}>
						<h2>Amplify Example App</h2>
						<TextField
							onChange={(event) => setInput('name', event.target.value)}
							style={styles.input}
							value={formState.name}
							placeholder="Name"
						/>
						<TextField
							onChange={(event) => setInput('description', event.target.value)}
							style={styles.input}
							value={formState.description}
							placeholder="Description"
						/>
						{
							!editing
								? (
									<Button
										style={styles.button}
										onClick={addTodo}
										color="primary"
										variant="outlined"
										type="submit"
									>
										Create Todo
									</Button>
								)
								:							(
									<Button
										style={styles.button}
										onClick={saveTodo}
										color="primary"
										variant="outlined"
										type="submit"
									>
										Save Todo
									</Button>
								)
						}
					</form>
				</CardContent>
				<CardContent>
					<List dense>
						{
							todos.map((todo, index) => (
								<ListItem style={styles.item} key={todo[index]}>
									<ListItemText
										primary={todo.name}
										secondary={todo.description}
									/>
									<ListItemAvatar>
										<IconButton
											edge="end"
											aria-label="delete"
											onClick={() => updateThisTodo(todo)}
										>
											<CreateIcon />
										</IconButton>
									</ListItemAvatar>
									<ListItemSecondaryAction>
										<IconButton
											edge="end"
											aria-label="delete"
											onClick={() => removeTodo(todo)}
										>
											<DeleteIcon />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
							))
						}
					</List>
				</CardContent>
			</Card>
		</div>
	);
};
export default withAuthenticator(App);
