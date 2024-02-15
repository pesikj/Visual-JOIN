var joinApp = angular.module('joinApp', ['ngSanitize']);



function JoinsCtrl($scope) {


  $scope.users = [
    { id: 1, name: 'Aneta' },
    { id: 2, name: 'Martina' },
    { id: 3, name: 'Dan' },
    { id: 4, name: 'Honza' },
    { id: 5, name: 'Martin' },
    { id: 6, name: 'Mirka' },
    { id: 7, name: 'Jirka' },
    { id: 8, name: 'Lenka' },
    { id: 9, name: 'Verča' },
  ];

  $scope.likes = [
    { user_id: 3, like: 'Python' },
    { user_id: 1, like: 'Pandas' },
    { user_id: 2, like: 'Seaborn' },
    { user_id: 10, like: 'Numpy' },
    { user_id: 11, like: 'Matplotlib' }
  ];

  $scope.sql = {
    show_desc: false,
    toggle_desc: function(){
      $scope.sql.show_desc = $scope.sql.show_desc ? false : true;
    },
    inner: {
      query: "merged = pd.merge(users, likes, how=\"inner\", left_on=\"id\", right_on=\"user_id\")<br/>merged[\"name\",\"like\"]",
      desc: "Při použití inner (nebo při vynechání parametru how) získáme všechny uživatele, kteří dali nějaký \"lajk\", a všechny \"lajky\", ke kterým máme záznam v tabulce uživatelů."
    },
    left: {
      query: "merged = pd.merge(users, likes, how=\"left\", left_on=\"id\", right_on=\"user_id\")<br/>merged[\"name\",\"like\"]",
      desc: "Při použití metody \"left\" získáme všechny uživatele bez ohledu na to, zda dali nějaký \"lajk\" či nikoliv, společně s všemi \"lajky\", které odpovídají uživatelům z tabulky users. To znamená, že pokud někteří uživatelé nedali žádný \"lajk\", budou i tak zahrnuti ve výsledné tabulce s hodnotami NaN v sloupcích odpovídajících tabulce \"likes\"."
    },
    right: {
      query: "merged = pd.merge(users, likes, how=\"right\", left_on=\"id\", right_on=\"user_id\")<br/>merged[\"name\",\"like\"]",
      desc: "Při použití metody \"right\" získáme všechny \"lajky\" spolu s odpovídajícími uživateli z levé tabulky, pokud existuje shoda mezi oběma tabulkami. Pokud některé \"lajky\" nemají odpovídajícího uživatele v tabulce \"users\", budou i tak zahrnuty ve výsledné tabulce, ale s hodnotami NaN v sloupcích odpovídajících tabulce \"users\"."
    },
    outer: {
      query: "merged = pd.merge(users, likes, how=\"outer\", left_on=\"id\", right_on=\"user_id\")<br/>merged[\"name\",\"like\"]",
      desc: "Při použití metody \"outer\" získáme všechny uživatele a všechny \"lajky\", nezávisle na tom, zda existuje mezi nimi shoda. To znamená, že pokud existují uživatelé bez \"lajků\" nebo \"lajky\" bez odpovídajících uživatelů, budou všechny tyto záznamy zahrnuty ve výsledné tabulce s hodnotami NaN v sloupcích, kde neexistuje shoda mezi tabulkami \"users\" a \"likes\"."
    }
  };

  $scope.joins = [];
  $scope.user_ids = [];
  $scope.current_join = 'inner';
  $scope.type = false;

  $scope.isNotSelected = function(id){
    if($scope.user_ids.indexOf(id) === -1){
      return 'is-not-selected';
    }
  }

  $scope.currentJoinClass = function(join){
    if($scope.current_join == join){
      return 'current-join';
    }
  }


  $scope.selectJoin = function(join){
    $scope.current_join = join;
    $scope[join +'Join']();
  };

  $scope.removeItem = function(type, index){
    $scope[type].splice(index, 1);
    $scope.selectJoin($scope.current_join);
  };


  $scope.addModal = function(type){
    $scope.type = type;
    var id = 1;

    $scope.modalType = 'add';

    // auto-increment user id as default on add and show lates
    $scope.users.forEach(function(user){
      if(id < user.id) id = user.id;
    });
    if(type == 'users'){
      id++;
    }
    $scope.addId = id;

    // Focus on the id field
    setTimeout(function(){
      var add = document.getElementById('addId');
      add.focus();
    }, 100)

  }

  $scope.addItem = function(){

    // add the item to the array
    if($scope.type == 'users'){
      $scope[$scope.type].push({ id: $scope.addId, name: $scope.addName });
    }else{
      $scope[$scope.type].push({ user_id: $scope.addId, like: $scope.addName });
    }

    // Clear the data
    $scope.addName = '';
    $scope.addId = '';

    // recreate the join table
    $scope.selectJoin($scope.current_join);

    // Close the modal
    $scope.modalType = false;
  };


  // SELECT users.name, likes.like FROM users JOIN likes ON users.id = likes.user_id;
  $scope.innerJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all likes and users to find matches
    angular.forEach($scope.likes, function(like){ // value, key
      angular.forEach($scope.users, function(user){
        if(user.id == like.user_id){
          result.push({ name: user.name, like: like.like });
          $scope.user_ids.push(user.id);
        }
      });
    });
    $scope.joins = result;
  };

  // Default
  $scope.innerJoin();


  // SELECT users.name, likes.like FROM users LEFT JOIN likes ON users.id = likes.user_id;
  $scope.leftJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all likes and users to find matches
    angular.forEach($scope.users, function(user){ // value, key
      var hasLike = false;
      $scope.user_ids.push(user.id);
      angular.forEach($scope.likes, function(like){
        if(user.id == like.user_id){
          result.push({ name: user.name, like: like.like });
          hasLike = true;
        }
      });
      if(!hasLike){
        result.push({ name: user.name, like: 'NULL' });
      }
    });
    $scope.joins = result;
  };


  // SELECT users.name, likes.like FROM users RIGHT JOIN likes ON users.id = likes.user_id;
  $scope.rightJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all likes and users to find matches
    angular.forEach($scope.likes, function(like){ // value, key
      var hasLike = false;
      $scope.user_ids.push(like.user_id);
      angular.forEach($scope.users, function(user){
        if(user.id == like.user_id){
          result.push({ name: user.name, like: like.like });
          hasLike = true;
        }
      });
      if(!hasLike){
        result.push({ name: 'NULL', like: like.like });
      }
    });
    $scope.joins = result;
  };


  // SELECT users.name, likes.like FROM users LEFT OUTER JOIN likes ON users.id = likes.user_id
  // UNION
  // SELECT users.name, likes.like FROM users RIGHT OUTER JOIN likes ON users.id = likes.user_id
  $scope.outerJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all likes and users to find matches
    angular.forEach($scope.users, function(user){ // value, key
      var hasLike = false;
      $scope.user_ids.push(user.id);
      angular.forEach($scope.likes, function(like){
        if(user.id == like.user_id){
          result.push({ name: user.name, like: like.like });
          hasLike = true;
        }
      });
      if(!hasLike){
        result.push({ name: user.name, like: 'NULL' });
      }
    });

    // Loop through all likes and users to find matches
    angular.forEach($scope.likes, function(like){ // value, key
      if($scope.user_ids.indexOf(like.user_id) === -1){
        result.push({ name: 'NULL', like: like.like });
        $scope.user_ids.push(like.user_id);
      }
    });

    $scope.joins = result;
  };

}





// Heigh and width = canvas
var height = 150,                         // Canvas height
    width = height + height / 2,          // Canvas width
    ratio = (window.innerWidth < 410 ) ? .25 : .5, // The <svg> size in ratio (If is mobile)
    strokeWidth = 3,                      // Circle stroke width
    s_width = width*ratio,                // <svg> width
    s_height = (height / width * s_width),// <svg> height

    center = height / 2,                  // first circle center left and both center top
    center2 = height,                     // Second circle
    radius = center - strokeWidth,        // The circles radius
    fillColor = "#CC333F";                // The fill color

// Set attributes on the svg tag
var svgAttr = {
  viewBox: "0 0 "+ width +" "+ height,
  preserveAspectRatio: "xMaxYmax",
  width: s_width,
  height: s_height
};

// Default attributes for the circles
var defaultAttr = {
  fill: "none",
  stroke: "#EB6841",
  strokeWidth: strokeWidth
};

// Create an object for the svg's with custom settings
var svgs = {
  // Inner Join
  inner: {},
  // Left Join
  left: {
    attr: {
      c1: {
        fill: fillColor
      },
      c2: {
        fill: "transparent"
      }
    }//
  },
  // Right Join
  right: {
    reverse: true,
    attr: {
      c1: {
        fill: "transparent"
      },
      c2: {
        fill: fillColor
      }
    }//
  },
  // Outer Join
  outer: {
    attr: {
      c1: {
        fill: fillColor
      },
      c2: {
        fill: fillColor
      }
    }
  }
};

// Loop through all svg's and create the circles
for(var svg in svgs){

  // Attach the current object to a variable
  var current = svgs[svg];
  current.main = Snap("#"+ svg).attr(svgAttr);

  // Create an array of the 2 circles and if isset revers the order
  var circles = ['c1', 'c2'];
  if(current.reverse) circles.reverse()

  // Loop through the 2 circles
  circles.forEach(function(key){

    // depending on which circle make left center different
    var center1 = (key == 'c1') ? center : center2;
    var table = (key == 'c1') ? 'users' : 'likes';

    // Create the circle with default attr and the table it represent
    current[key] = current.main.circle(center1, center, radius)
                    .attr(defaultAttr)
                    .data('table', table);

    if(key == 'c1'){
      current[key].attr({
        stroke: "#00A0B0"
      })
    }
  });

  // Set custom attributes on the circles
  if(typeof current.attr != 'indefined'){
    for(var circle in current.attr){
      current[circle].attr(current.attr[circle]);
    }
  }
};


// inner
var inner = svgs.inner.main;
// Generate a new circle and one mask part of it
var cc1_inner = inner.circle(center,center,radius);
cc1_inner.attr({
    fill: fillColor
});
var cc2_inner = inner.circle(center2,center,radius);
cc2_inner.attr({
  fill: "#fff"
});
cc1_inner.attr({
  mask: cc2_inner
});


// Outer
var outer = svgs.outer.main;
// Create another circle to generate the crossing strokes
var cc1 = outer.circle(center,center,radius);
cc1.attr({
    fill: "none",
    stroke: "#00A0B0",
    strokeWidth: strokeWidth
});
