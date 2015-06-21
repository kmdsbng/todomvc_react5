/*global React, Router, classNames*/
var app = app || {};

var cx = classNames;

var TodoApp = React.createClass({
  render: function () {
    return (
    <section id="todoapp">

      <div>
        <header id="header">
          <h1>todos</h1>
          <input id="new-todo" placeholder="What needs to be done?" />
        </header>
        <section id="main">
          <input id="toggle-all" type="checkbox" />
          <ul id="todo-list">

            <li className="completed">
              <div className="view">
                <input className="toggle" type="checkbox" checked="true" />
                <label>Completed Item</label>
                <button className="destroy"></button>
              </div>
              <input className="edit" value="" />
            </li>

            <li className="editing">
              <div className="view">
                <input
                  className="toggle"
                  type="checkbox"
                  checked="true"
                />
                <label>Editing Item</label>
                <button className="destroy"></button>
              </div>
              <input className="edit" value="Editing Item" />
            </li>


            <li className="">
              <div className="view">
                <input className="toggle" type="checkbox" checked="true" />
                <label>Uncompleted Item</label>
                <button className="destroy"></button>
              </div>
              <input className="edit" value="" />
            </li>
          </ul>
        </section>

        <footer id="footer">
          <span id="todo-count">
            <strong>2</strong> items left
          </span>
          <ul id="filters">
            <li>
              <a href="#/" className="selected">All</a>
            </li>
            <li>
              <a href="#/active" className="">Active</a>
            </li>
            <li>
              <a href="#/completed" className="">Completed</a>
            </li>

          </ul>
          <button id="clear-completed" >Clear completed</button>
        </footer>

      </div>


    </section>
    );
  }
});

var todoApp = <TodoApp />;

React.render(
  todoApp,
  document.getElementById('todoapp'));



