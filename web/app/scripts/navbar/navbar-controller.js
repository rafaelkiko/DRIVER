(function () {
    'use strict';

    /* ngInject */
    function NavbarController($log, $rootScope, $state, $stateParams, RecordTypes) {
        var ctl = this;
        ctl.onRecordTypeSelected = onRecordTypeSelected;
        ctl.onStateSelected = onStateSelected;
        ctl.navigateToStateName = navigateToStateName;

        setRecordTypes();
        setStates();
        $rootScope.$on('$stateChangeSuccess', setStates);

        // Sets the list of available record types, and also the active one if provided
        function setRecordTypes() {
            RecordTypes.query({ active: 'True' }, function(recordTypes) {
                ctl.recordTypes = recordTypes;
                if (!recordTypes.length) {
                    $log.warn('No record types returned');
                } else {
                    if ($stateParams.rtuuid) {
                        var index = _.findIndex(recordTypes, function(rt) {
                            return rt.uuid === $stateParams.rtuuid;
                        });

                        if (index < 0) {
                            $log.warn('Record type UUID is invalid');
                        } else {
                            ctl.selectedRecordType = recordTypes[index];
                        }
                    }

                    if (!ctl.selectedRecordType) {
                        ctl.selectedRecordType = recordTypes[0];
                    }
                }
            });
        }

        // Sets states that can be navigated to (exclude current state, since we're already there)
        function setStates() {
            ctl.selectedState = $state.current;
            ctl.availableStates = _.chain($state.get())
                .map(function(name) { return $state.get(name); })
                .filter(function(state) {
                    return state.showInNavbar && state.name !== $state.current.name;
                })
                .value();
        }

        // Updates the ui router state based on selected navigation parameters
        function updateState() {
            $state.go(ctl.selectedState.name, {
                rtuuid: ctl.selectedRecordType.uuid
            });
        }

        // Handler for when a record type is selected from the dropdown
        function onRecordTypeSelected(recordType) {
            ctl.selectedRecordType = recordType;
            updateState();
        }

        // Handler for when a navigation state is selected from the dropdown
        function onStateSelected(navState) {
            ctl.selectedState = navState;
            updateState();
        }

        // Handler for when a navigation state is selected from the dropdown
        function navigateToStateName(stateName) {
            onStateSelected($state.get(stateName));
        }
    }

    angular.module('driver.navbar')
    .controller('NavbarController', NavbarController);

})();