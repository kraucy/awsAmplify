import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import {
	Button,
	Card,
	CardContent,
	FormControlLabel,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemSecondaryAction,
	ListItemText,
	Switch,
	TextField,
	Typography,
} from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { listTodos } from './graphql/queries';
import {
	add, createTodo, deleteTodo, updateTodo,
} from './graphql/mutations';
import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

const initialState = { name: '', description: '' };
const initialNumState = { number1: 0, number2: 0 };

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
	const [checked, setChecked] = useState(false);
	const [formState, setFormState] = useState(initialState);
	const [todos, setTodos] = useState([]);
	const [sum, setSum] = useState(0);
	const classes = useStyles();

	function setInput(key, value) {
		setFormState({ ...formState, [key]: value });
	}

	async function fetchTodos() {
		try {
			const todoData = await API.graphql(graphqlOperation(listTodos));
			const listOfTodos = todoData.data.listTodos.items;
			setTodos(listOfTodos);
		} catch (error) {
			console.log('error fetching todos', error);
		}
	}

	async function addTodo(event) {
		try {
			if (!formState.name || !formState.description) {
				event.preventDefault();
				return;
			}
			const todo = { ...formState };
			setTodos([...todos, todo]);
			setFormState(initialState);
			await API.graphql(graphqlOperation(createTodo, { input: todo }));
			fetchTodos();
		} catch (error) {
			console.log('error creating todo:', error);
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
		try {
			await API.graphql(graphqlOperation(updateTodo, { input: formState }));
			fetchTodos();
			setFormState(initialState);
			setEditState(false);
		} catch (error) {
			console.log('error updating todo:', error);
		}
	}

	async function removeTodo(todo) {
		try {
			await API.graphql(graphqlOperation(deleteTodo, { input: { id: todo.id } }));
			setFormState(initialState);
			fetchTodos();
		} catch (error) {
			console.log('error deleting todo:', error);
		}
	}

	async function addInputs(event) {
		event.preventDefault();
		try {
			const numbersSum = await API.graphql(graphqlOperation(add, {
				number1: +formState.number1, number2: +formState.number2,
			}));
			setSum(numbersSum.data.add);
		} catch (error) {
			console.log('error adding numbers', error);
		}
	}

	const check = () => {
		setChecked(!checked);
		if (checked) {
			setFormState(initialNumState);
			setSum(0);
		}
		setFormState(initialState);
	};

	const ListItems = () => (
		todos.map((todo) => (
			<ListItem
				style={styles.item}
				key={todo.id}
			>
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
	);

	const ShowButtons = () => {
		if (editing) {
			return (
				<Button
					style={styles.button}
					onClick={saveTodo}
					color="primary"
					variant="outlined"
					type="submit"
				>
					Save Todo
				</Button>
			);
		}
		return (
			<Button
				style={styles.button}
				onClick={addTodo}
				color="primary"
				variant="outlined"
				type="submit"
			>
				Create Todo
			</Button>
		);
	};

	useEffect(() => {
		fetchTodos();
	}, []);

	return (
		<div className="App">
			<Card style={styles.container}>
				<h2>Amplify Example App</h2>
				<CardContent>
					<FormControlLabel
						control={(
							<Switch
								checked={checked}
								onChange={check}
								name="Switch input"
								color="primary"
								inputProps={{ 'aria-label': 'checkbox' }}
							/>
						)}
						label={`${checked ? 'Numbers' : 'List View'}`}
					/>
				</CardContent>
				{
					checked ? (
						<CardContent>
							<form className={classes.root}>
								<TextField
									onChange={(event) => setInput('number1', event.target.value)}
									style={styles.input}
									value={formState.number1}
									placeholder="Number 1"
								/>
								<TextField
									onChange={(event) => setInput('number2', event.target.value)}
									style={styles.input}
									value={formState.number2}
									placeholder="Number 2"
								/>
								<Button
									style={styles.button}
									onClick={addInputs}
									color="primary"
									variant="outlined"
									type="submit"
								>
									Add Values
								</Button>
							</form>
						</CardContent>
					) : (
						<CardContent>
							<form className={classes.root}>

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
								<ShowButtons />
							</form>
						</CardContent>
					)

				}

				<CardContent>
					{
						checked
							? (
								<Typography>
									The sum is
									{' '}
									{sum}
								</Typography>
							)
							:							(
								<List dense>
									<ListItems />
								</List>
							)
					}
				</CardContent>
			</Card>
		</div>
	);
};
export default withAuthenticator(App);
