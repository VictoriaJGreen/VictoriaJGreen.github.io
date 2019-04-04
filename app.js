//const getDays = () => fetch('http://localhost:8080/days');
//const getRoutines = () => fetch('http://localhost:8080/routines');

//var ROOT_URL = "http://localhost:8080";
 var ROOT_URL = 'https://daydesign.herokuapp.com';

var app = new Vue({
  el: '#app',
  data: {
    logo: './img/logodaydesign.png',
    days: [],
    selectedDay: null,
    activeDay: null,
    routines: [],
    activeRoutine: null, 
    activeRoutineItem: "",
    newDayName: "",
    errors: [],
    firstName: "",
    lastName: "",
    email: "",
    plainPassword: "",
    existingEmail: "",
    existingPlainPassword: "",
    user: null
  },
  methods: {
    logout(e){
      e.preventDefault();
      return fetch(`${ROOT_URL}/logout`, {
        method: "GET",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          "Access-Control-Allow-Headers": "null"
        },
        credentials: 'include'
      }).then(response => {
        if (response.status == 200) {
          this.user = null;
        }
      })
    },
    login(e){
      e.preventDefault();
      let data = `email=${this.existingEmail}&plainPassword=${this.existingPlainPassword}`;
      return fetch(`${ROOT_URL}/login`, {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded", 
          "Access-Control-Allow-Headers": "null"
        },
        credentials: 'include',
        body: data
      }).then(response => {
        if (response.status == 200) {
          response.json().then(user => {
            //don't select day until I have all my days and all my routines
            //selected day routine ids need to be matched to their routine obj.
            this.user = user;
            this.loadUserData().then(() => {
              if(this.days.length > 0) {
                this.selectDay(this.days[0]);
              }
            });
          });
        }
      })
    },
    

    registerUser(e) {
      e.preventDefault();
      // validate the data first
      // this.validateUser();
      if (this.errors.length > 0) {
        return;
      }

      this.createUser({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        plainPassword: this.plainPassword
      }).then(response => {
        if (response.status == 201) {
          console.log("User created.");
          console.log(response);
          response.json().then(user => {
            this.user = user;
          }).then(() => {
            this.existingEmail = this.email;
            this.existingPlainPassword = this.plainPassword;
            this.login(e);
          });
        } else if (response.status == 422) {
          response.json().then(function(errors) {
            alert("This email is already registered.");
          });
        } else {
          alert("Bad things have happened. Probably give up.");
        }
      }, err => {
        alert(err);
      });
    },

    createUser(user) {
      let data = `firstName=${encodeURIComponent(user.firstName)}`;
      data += `&lastName=${encodeURIComponent(user.lastName)}`;
      data += `&email=${encodeURIComponent(user.email)}`;
      data += `&plainPassword=${encodeURIComponent(user.plainPassword)}`;

      console.log(data);
      return fetch(`${ROOT_URL}/users`, {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          "Access-Control-Allow-Headers": "null"
        },
        credentials: 'include',
        body: data
      })
    },

    isValidRoutine() {
      this.errors = [];
      if (!this.activeRoutine) { // Cant create if object is missing exists
        this.errors.push('bad routine! >:{');
      }
      if (this.activeRoutineItem && this.activeRoutineItem.replace(/\s/g,'').length > 0) {
        this.errors.push('add new routine item before trying to save routine! >:{');
      }
      if (!this.activeRoutine.name || this.activeRoutine.name.replace(/\s/g,'').length == 0) { // Cant create if name is just white space
        this.errors.push('missing routine name! >:{');
      }
      if (!this.activeRoutine.items) {
        this.errors.push('routine items can be empty, but NOT NULL! >:{');
      }
      return this.errors.length == 0;
    },

    selectDay(day){
      let selectedDayRoutines = []; // information that goes with first day

      day.routineIds.forEach(selectedDayRoutineId => {
        this.routines.forEach(routine => {
          if (routine._id == selectedDayRoutineId) { 
            selectedDayRoutines.push(routine);
          }
        })
      });

      this.selectedDay = {
        _id: day._id,
        name: day.name,
        routines: selectedDayRoutines,
        isBeingEdited: false
      };
    },

    editSelectedDay() {
      this.selectedDay.isBeingEdited = true;
      this.routines = this.routines.filter(r => this.selectedDay.routines.every(sdr => sdr._id != r._id));
    },

    initActiveRoutine(routine) {
      this.errors = [];
      if (this.selectedDay.isBeingEdited) {
        if (routine) {
          this.selectedDay.routines.push(routine);
          this.updateDay();
        } else {
          this.selectedDay.isBeingEdited = false;
          this.getRoutines();
        }
      } else {
        this.activeRoutine = routine || { // js truthiness; pick first IF NOT NULL
          _id: null,
          name: "",
          items: []
        };
      }
    },

    updateDay() {
      let request = `name=${this.selectedDay.name}`;
      this.selectedDay.routines.forEach(routine => request += `&routineIds=${routine._id}`);

      return fetch(`${ROOT_URL}/days/${this.selectedDay._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Access-Control-Allow-Headers": "null"
        },
        credentials: 'include',
        body: request
      }).then(() => {
        this.loadUserData().then(() => {
          this.selectedDay.isBeingEdited = false;
        });
      }).catch(err => alert(err));
    },

    updateRoutine() {
      if (!this.isValidRoutine()) {
        return;
      }
      if (!this.activeRoutine._id) { // Cant create if already exists
        this.errors.push('cant\'t update routine, it doesnt have an id! >:{');
        return;
      }

      let request = `name=${this.activeRoutine.name}`;
      this.activeRoutine.items.filter(i => i.name.replace(/\s/g,'').length > 0).forEach(item => request += `&itemNames=${item.name}`);

      return fetch(`${ROOT_URL}/routines/${this.activeRoutine._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Access-Control-Allow-Headers": "null"
        },
        credentials: 'include',
        body: request
      }).then(() => {
        this.activeRoutine = null;
        $('#routineModal').modal('hide'); // Just used to hide bootstrap modal
        this.getRoutines();
      }).catch(err => alert(err));
    },

    deleteRoutine() {
      return fetch(`${ROOT_URL}/routines/${this.activeRoutine._id}`, { 
        method: 'DELETE' 
      }).then(() => {
        this.getRoutines().then(() => {
          $('#routineModal').modal('hide');
          this.activeRoutine = null;
        })
      }).catch(err => alert(err));
    },

    deleteDay() {
      return fetch(`${ROOT_URL}/day/${this.selectedDay._id}`, { 
        method: 'DELETE'
      }).then(() => {
        this.loadUserData().then(() => {
          if(this.days.length > 0) {
            this.selectDay(this.days[0]);
          }
        });
      }).catch(err => alert(err));
    },

    createNewRoutine() {
      if (!this.isValidRoutine()) {
        return;
      }

      let request = `name=${this.activeRoutine.name}`;
      this.activeRoutine.items.forEach(item => request += `&itemNames=${item.name}`);

      return fetch(`${ROOT_URL}/routines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Access-Control-Allow-Headers": "null"
        },
        credentials: 'include',
        body: request
      }).then(() => {
        $('#routineModal').modal('hide'); // Just used to hide bootstrap modal
        this.activeRoutine = null;
        this.getRoutines();
      }).catch(err => alert(err));
    },

    getDays() {
      return fetch(`${ROOT_URL}/days`, { 
        headers: {
        "Content-type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Headers": "null"
      }, 
      credentials: 'include'}).then(res => res.json().then(data => this.days = data));
    },

    getRoutines(){
      return fetch(`${ROOT_URL}/routines`, { 
        headers: {
        "Content-type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Headers": "null"
      }, 
      credentials: 'include'}).then(res => {
        return res.json().then(data => {
          console.log("ROUTINES: ", data);
          this.routines = data;
        })
      })
    },

    createNewRoutineItem() {
      if (this.activeRoutineItem && this.activeRoutineItem.replace(/\s/g,'').length == 0) {
        this.errors = ['missing routine item name >:{'];
        return;
      } 
      
      this.activeRoutine.items.push({ name: this.activeRoutineItem }); // need to create a NEW ITEM OBJECT with a name: activeRoutineItem
      this.activeRoutineItem = "";
    },

    createNewDay() {
      if (!this.newDayName || this.newDayName.replace(/\s/g,'').length == 0) {
        this.errors.push('missing new day name');
        return;
      }

      return fetch(`${ROOT_URL}/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Access-Control-Allow-Headers": "null"
        },
        credentials: 'include',
        body: `name=${this.newDayName}`
      }).then(() => {
        $('#newDayModal').modal('hide'); // Just used to hide bootstrap modal
        this.newDayName = "";
        this.getDays();
      }).catch(err => alert(err));
    },

    loadUserData() {
      return this.getDays().then(() => {
         return this.getRoutines();
      });
    },

    created() {
      console.log("VUE is ready");
    }
  }
});