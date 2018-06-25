export default function navCtrl($rootScope, $scope, $timeout) {
    $scope.current_route = window.location.hash.substring(2);
    $scope.assignRoute = function(route) {
        $timeout(function(){
            $scope.$apply(function() {
                $scope.current_route = route;
            });
        }, 1);
    };

    $rootScope.$on('change_view', function(event, view_name) {
        $scope.assignRoute(view_name);
    });
}