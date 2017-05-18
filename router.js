(function(){
    var pathMap = {};
    var Router = function(options) {
        this.setupListeners();
    };
    Router.prototype = {
        map: function() {

        },
        transitionTo: function() {

        },
        setupListeners: function() {
            window.addEventListener('hashchange', function () {

            });
        }
    };
    return Router;
})()
