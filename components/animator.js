'use strict';

/**
 * Animator - Creates page transitions when bound to mithril components.
 * Usage: const anim = new Animator(); then bind anim.create and anim.remove to oncreate and onremove lifecycle events.
 * @constructor
 * @param {string} namespace Name of the main component to save history of page transitions in browser session
 */
var Animator = function Animator(namespace) {
    var self = this;
    var history = [];
    var lastNode = null;

    var getDirection = function getDirection(nextkey, lastkey) {
        var direction = 'next';
        if (sessionStorage.getItem(namespace)) {
            history = JSON.parse(sessionStorage.getItem(namespace));
        }
        var idx = history.indexOf(nextkey);
        if (idx > -1) {
            direction = 'prev';
            if (idx == 0) {
                history = [];
            } else {
                history = history.slice(0, idx);
            }
        } else {
            history.push(lastkey);
        }
        sessionStorage.setItem(namespace, JSON.stringify(history));
        return direction;
    };

    self.create = function (vnode) {
        if (!vnode.key) return;
        var id = 'anim' + Date.now();

        if (lastNode) {
            var direction = getDirection(vnode.key, lastNode.key);
            var lastElem = lastNode.dom;
            var uncompleted = true;

            lastElem.setAttribute('data-anim-id', id);
            vnode.dom.parentNode.insertAdjacentHTML('beforeend', lastElem.outerHTML);
            lastElem = vnode.dom.parentNode.querySelector('[data-anim-id=' + id + ']');

            var animEnd = function animEnd(e) {
                var elem = e.target;
                elem.removeEventListener('animationend', animEnd);
                if (elem.getAttribute('data-anim-id')) {
                    elem.parentNode.removeChild(elem);
                }
                if (uncompleted) {
                    uncompleted = false;
                } else {
                    document.body.classList.remove('anim-parent');
                    vnode.dom.parentNode.classList.remove('anim-parent');
                    vnode.dom.classList.remove('anim-next-element', 'anim-direction-' + direction);
                }
            };
            lastElem.addEventListener('animationend', animEnd);
            vnode.dom.addEventListener('animationend', animEnd);

            document.body.classList.add('anim-parent');
            vnode.dom.parentNode.classList.add('anim-parent');
            lastElem.classList.add('anim-last-element', 'anim-direction-' + direction);
            vnode.dom.classList.add('anim-next-element', 'anim-direction-' + direction);
        }
    };

    self.remove = function (vnode) {
        if (!vnode.key) return;
        lastNode = {
            key: vnode.key,
            dom: vnode.dom
        };
    };
};

module.exports = Animator;