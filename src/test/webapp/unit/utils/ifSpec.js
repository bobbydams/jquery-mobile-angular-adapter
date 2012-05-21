describe("ngm-if", function () {
    var element, scope;

    function compile(html) {
        var d = testutils.compileInPage(html);
        element = d.element;
        scope = element.scope();
    }

    beforeEach(function () {
        scope = null;
        element = null;
    });

    it('should add the element if the expression is true', function () {
        compile('<div><span ngm-if="true">A</span></div>');
        expect(element.children('span').length).toEqual(1);
    });

    it('should remove the element if the expression is false', function () {
        compile('<div><span ngm-if="false">A</span></div>');
        expect(element.children('span').length).toEqual(0);
    });

    it('should use an own scope', function () {
        compile('<div><span ngm-if="true"><span ng-init="test = true"></span></span></div>');
        expect(scope.test).toBeFalsy();
        expect(element.children('span').scope().test).toBeTruthy();
    });

    describe('with elements that wrap themselves into new elements', function () {
        beforeEach(function () {
            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('wrapper', function () {
                    return {
                        restrict:'A',
                        link:function (scope, iElement) {
                            iElement.wrap("<div class='wrapper'></div>");
                        }
                    }
                });
            });
        });

        it("should remove the wrapper elements with the elements", function() {
            var c = testutils.compileInPage('<div><span ngm-if="value" wrapper="true"></span></div>');
            var scope = c.element.scope();
            scope.value = true;
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(1);

            scope.value = false;
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(0);
        });
    });

    describe("fire $childrenChanged", function() {
        var eventSpy;
        beforeEach(function() {
            compile('<div><span ngm-if="show"></span></div>');
            eventSpy = jasmine.createSpy("$childrenChanged");
            element.bind("$childrenChanged", eventSpy);
        });

        it("should fire the event when the content is added", function() {
            scope.show = true;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should fire the event when the content is hidden", function() {
            scope.show = true;
            scope.$root.$digest();
            eventSpy.reset();

            scope.show = false;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should not fire if nothing changes", function() {
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(0);
        });
    });
});