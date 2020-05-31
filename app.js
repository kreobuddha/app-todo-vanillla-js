const addForm = document.querySelector('.j-add-form');
const listOpen = document.querySelector('.j-todo-list--open');
const listInProgree = document.querySelector('.j-todo-list--in-progress');
const listCompleted = document.querySelector('.j-todo-list--completed');
const columns = document.querySelector('.j-columns');


let isOpenList = (card) => {
  return card.parentElement.classList.contains('j-todo-list--open');
};
let isInProgressList = (card) => {
  return card.parentElement.classList.contains('j-todo-list--in-progress');
};
let isCompletedList = (card) => {
  return card.parentElement.classList.contains('j-todo-list--completed');
};

let addTodo = (todo, id) => {
  let time = todo.created_at.toDate();
  let html = `
    <li class="card" data-id="${id}" data-created_at="${time}">
      <p class="text">${todo.title}</p>
      <i class="far fa-trash-alt delete j-delete"></i>

      <div class="move-group">
        <i class="fas fa-arrow-left move-left j-move-left"></i>
        <i class="fas fa-arrow-up move-up j-move-left"></i>
        <i class="fas fa-arrow-right move-right j-move-right"></i>
        <i class="fas fa-arrow-down move-down j-move-right"></i>
      </div>
    </li>`;

  if (todo.status === 'open') {
    listOpen.innerHTML += html;
  }
  
  if (todo.status === 'in-progress') {
    listInProgree.innerHTML += html;
  }
  
  if (todo.status === 'completed') {
    listCompleted.innerHTML += html;
  }
};


let deleteTodo = id => {
  const todos = document.querySelectorAll('.card');
  todos.forEach(todo => {
    if (todo.getAttribute('data-id') === id) {
      todo.remove()
    }
  })
};

let updateStatus = (card, id, status, list) => {
  db.collection('todos').doc(id).update({
    status: status
  }).then(() => {
    list.append(card);
  }).catch(err => {
    console.log(err);
  });
};



// get todos
db.collection('todos').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    const doc = change.doc;
    if (change.type === 'added') {
      addTodo(doc.data(), doc.id);
    } else if (change.type === 'removed') {
      deleteTodo(doc.id);
    }
  });
})





// add todos
addForm.addEventListener('submit', e => {
  e.preventDefault();

  let todo = addForm.add.value.trim();
  
  if (todo.length) {
    const now = new Date();
    const newTodo = {
      title: todo,
      status: 'open',
      created_at: firebase.firestore.Timestamp.fromDate(now)
    }

    db.collection('todos').add(newTodo).then(() => {
      // console.log('todo is added');
    }).catch(err => {
      console.log(err);
    });

    addForm.reset();
  }
});





// delete todos
columns.addEventListener('click', e => {
  if (e.target.classList.contains('j-delete')) {
    const id = e.target.parentElement.getAttribute('data-id');
    db.collection('todos').doc(id).delete().then(() => {
      // console.log('todo deleted');
    }).catch(err => {
      console.log(err);
    });
  }
});




// move card
columns.addEventListener('click', e => {

  //to the right
  if (e.target.classList.contains('j-move-right')) {
    const card = e.target.parentElement.parentElement;
    const id = card.getAttribute('data-id');

    if ( isOpenList(card) ) {
      updateStatus(card, id, 'in-progress', listInProgree);
    } else if ( isInProgressList(card) ) {
      updateStatus(card, id, 'completed', listCompleted);
    }
  }

  // to the left
  if (e.target.classList.contains('j-move-left')) {
    const card = e.target.parentElement.parentElement;
    const id = card.getAttribute('data-id');
    
    if ( isInProgressList(card) ) {
      updateStatus(card, id, 'open', listOpen);
    } else if ( isCompletedList(card) ) {
      updateStatus(card, id, 'in-progress', listInProgree);
    }
  }
});

