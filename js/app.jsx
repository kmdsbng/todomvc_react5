/*global React, Router, classNames*/
var app = app || {};

var cx = classNames;

app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

var ESCAPE_KEY = 27;
var ENTER_KEY = 13;

var MODEL_KEY = 'react-todos';

var TodoModel = function (key) {
  this.key = key;
  this.todos = app.Utils.store(key);
  this.subscribers = [];
};

var mproto = TodoModel.prototype;

mproto.isAllCompleted = function () {
  var completedTodos = this.todos.filter(function (todo) {return todo.completed; });
  return (completedTodos.length > 0) &&
    (this.todos.length === completedTodos.length);
};

mproto.toggleAll = function () {
  if (this.isAllCompleted()) {
    this.todos = this.todos.map(function (todo) {
      return app.Utils.extend({}, todo, {completed: false});
    });
  } else {
    this.todos = this.todos.map(function (todo) {
      return app.Utils.extend({}, todo, {completed: true});
    });
  }
  this.inform();
};

mproto.clearCompleted = function () {
  this.todos = this.todos.filter(function (todo) {
    return !todo.completed;
  });
  this.inform();
};

mproto.subscribe = function (subscriber) {
  this.subscribers.push(subscriber);
};

mproto.inform = function () {
  app.Utils.store(this.key, this.todos);
  this.subscribers.forEach(function (subscriber) {
    subscriber();
  });
};

mproto.addTodo = function (title) {
  this.todos.push({
    id: app.Utils.uuid(),
    title: title,
    completed: false
  });
  this.inform();
};

mproto.saveTodo = function (todoToSave, newTitle) {
  this.todos = this.todos.map(function (todo) {
    return (todo.id === todoToSave.id) ?
      app.Utils.extend({}, todo, {title: newTitle}) :
      todo;
  });
  this.inform();
};

mproto.toggleTodo = function (todoToToggle) {
  this.todos = this.todos.map(function (todo) {
    return (todo.id === todoToToggle.id) ?
      app.Utils.extend({}, todo, {completed: !todo.completed}) :
      todo;
  });
  this.inform();
};

mproto.destroyTodo = function (todoToDestroy) {
  this.todos = this.todos.filter(function (todo) {
    return todo.id !== todoToDestroy.id;
  });
  this.inform();
};

var TodoItem = React.createClass({
  getInitialState: function () {
    return {
      editingText: this.props.todo.title
    };
  },
  componentDidUpdate: function (prevProps) {
    if (!prevProps.editing && this.props.editing) {
      var node = React.findDOMNode(this.refs.editField);
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  },
  render: function () {
    return (
      <li className={cx({editing: this.props.editing, completed: this.props.todo.completed})}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            onChange={this.handleToggle}
          />
          <label
            onDoubleClick={this.handleEditStart}
            >{this.props.todo.title}</label>
          <button
            onClick={this.handleDestroy}
            className="destroy"></button>
        </div>
        <input
          ref="editField"
          className="edit"
          onChange={this.handleEditChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
          value={this.state.editingText} />
      </li>

    );
  },
  handleEditChange: function (e) {
    this.setState({editingText: e.target.value});
  },
  handleKeyDown: function (e) {
    if (e.which === ENTER_KEY) {
      var title = e.target.value.trim();
      this.saveTodo(title);
    } else if (e.which === ESCAPE_KEY) {
      this.setState({editingText: this.props.todo.title});
      this.props.onEditCancel();
    }
  },
  handleBlur: function (e) {
    var title = e.target.value.trim();
    this.saveTodo(title);
  },
  saveTodo: function (title) {
    if (title.length > 0) {
      this.props.onSave(this.props.todo, title);
    } else {
      this.handleDestroy();
    }
    this.setState({editingText: title});
  },
  handleEditStart: function () {
    this.setState({editingText: this.props.todo.title});
    this.props.onEditStart(this.props.todo);
  },
  handleToggle: function () {
    this.props.onToggle(this.props.todo);
  },
  handleDestroy: function () {
    this.props.onDestroy(this.props.todo);
  }
});

var TodoApp = React.createClass({
  getInitialState: function () {
    return {
      nowShowing: app.ALL_TODOS,
      editingId: null
    };
  },
  componentDidMount: function () {
    var router = Router({
      '/': this.setState.bind(this, {nowShowing: app.ALL_TODOS}),
      '/active': this.setState.bind(this, {nowShowing: app.ACTIVE_TODOS}),
      '/completed': this.setState.bind(this, {nowShowing: app.COMPLETED_TODOS})
    });
    router.init('/');
  },
  render: function () {
    var todos = this.props.model.todos;
    var activeTodos = todos.filter(function (todo) {return !todo.completed; });
    var completedTodos = todos.filter(function (todo) {return todo.completed; });
    var showingTodos = (this.state.nowShowing === app.ALL_TODOS) ? todos :
      (this.state.nowShowing === app.ACTIVE_TODOS) ? activeTodos : completedTodos;

    var todoItems = showingTodos.map(function (todo) {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          onEditStart={this.editStart}
          onEditCancel={this.editCancel}
          onSave={this.saveTodo}
          onToggle={this.toggleTodo}
          onDestroy={this.destroyTodo}
          editing={this.state.editingId === todo.id}
        />
      );
    }, this);


    var main = null,
        footer = null;

    var clearButton = null;
    if (completedTodos.length > 0) {
      clearButton = (
        <button
          onClick={this.handleClearCompleted}
          id="clear-completed" >Clear completed</button>
      );
    }

    if (todos.length > 0) {
      main = (
        <section id="main">
          <input
            id="toggle-all"
            onChange={this.handleToggleAll}
            checked={this.props.model.isAllCompleted()}
            type="checkbox" />
          <ul id="todo-list">
            {todoItems}
          </ul>
        </section>

      );

      footer = (
        <footer id="footer">
          <span id="todo-count">
            <strong>{activeTodos.length}</strong> {app.Utils.pluralize(activeTodos.length, 'item')} left
          </span>
          <ul id="filters">
            <li>
              <a href="#/" className={cx({selected: this.state.nowShowing === app.ALL_TODOS})}>All</a>
            </li>
            <li>
              <a href="#/active" className={cx({selected: this.state.nowShowing === app.ACTIVE_TODOS})} >Active</a>
            </li>
            <li>
              <a href="#/completed" className={cx({selected: this.state.nowShowing === app.COMPLETED_TODOS})} >Completed</a>
            </li>

          </ul>
          {clearButton}
        </footer>
      );
    }


    return (
    <section id="todoapp">

      <div>
        <header id="header">
          <h1>todos</h1>
          <input
            id="new-todo"
            onKeyDown={this.handleKeyDown}
            autoFocus={true}
            placeholder="What needs to be done?" />
        </header>

        {main}

        {footer}
      </div>

    </section>
    );
  },
  handleToggleAll: function () {
    this.props.model.toggleAll();
  },
  handleClearCompleted: function () {
    this.props.model.clearCompleted();
  },
  editStart: function (todo) {
    this.setState({editingId: todo.id});
  },
  editCancel: function () {
    this.setState({editingId: null});
  },
  saveTodo: function (todo, title) {
    this.props.model.saveTodo(todo, title);
    this.setState({editingId: null});
  },
  toggleTodo: function (todo) {
    this.props.model.toggleTodo(todo);
  },
  destroyTodo: function (todo) {
    this.props.model.destroyTodo(todo);
  },
  handleKeyDown: function (e) {
    if (e.which === ENTER_KEY) {
      var newTitle = e.target.value.trim();
      if (newTitle) {
        this.props.model.addTodo(newTitle);
        e.target.value = '';
      }
    }
  }

});

var todoModel = new TodoModel(MODEL_KEY);

function render() {
  React.render(
    <TodoApp model={todoModel} />,
    document.getElementById('todoapp'));
}

render();
todoModel.subscribe(render);


