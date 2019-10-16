Vue.use(Vuex);
Vue.use(VeeValidate);
Vue.use(VueResource);

Vue.mixin({
    data() {
        return {
            baseUrl: baseURL,
            loaderId: "loader",
            snackbarId: "snackbar",
            alertBoxId: "alertBox",
        }
    },

    methods: {
        locationReload:function(){
            location.reload();
        },
        getCookie: function (name) {
            let cookiearray = document.cookie.split(';');
            let value = null;
            for (let cookie of cookiearray) {
                let data = cookie.split('=');
                if (name === data[0].trim()) {
                    value = data[1].trim();
                    break;
                }
            }
            return value;
        },
        snackbar(options) {
            let className = "snackbar show";
            if (options.type != "undefined") {
                if (options.type == "error") {
                    className += " error";
                } else if (options.type == "success") {
                    className += " success";
                }
            }
            let snackbarDiv = document.createElement("div");
            snackbarDiv.setAttribute('id', this.snackbarId);
            snackbarDiv.className = className;
            snackbarDiv.innerHTML = ((options.icon != "undefined") ? options.icon : "") + options.message;

            let bodyElement = document.body;
            bodyElement.appendChild(snackbarDiv);
            let self = this;
            setTimeout(function () {
                let element = document.getElementById(self.snackbarId);
                element.className = "";
                element.parentNode.removeChild(element);
            }, 3000);

        },
        alertBox(options) {
            let alertDiv = document.createElement("div");
            alertDiv.setAttribute('id', this.alertBoxId);
            alertDiv.className = "alertBox";

            let alertBoxDiv = document.createElement("div");
            alertBoxDiv.className = "box";

            if (options.title != "undefined") {
                let alertBoxHeaderDiv = document.createElement("div");
                alertBoxHeaderDiv.className = "box-header";
                let alertBoxHeaderTitle = document.createElement("strong");
                alertBoxHeaderTitle.innerHTML = options.title;
                alertBoxHeaderDiv.appendChild(alertBoxHeaderTitle);
                alertBoxDiv.appendChild(alertBoxHeaderDiv);
            }

            let alertBoxBodyDiv = document.createElement("div");
            alertBoxBodyDiv.className = "box-body";
            alertBoxBodyDiv.innerHTML = options.message;
            alertBoxDiv.appendChild(alertBoxBodyDiv);
            let alertBoxFooterDiv = document.createElement("div");
            alertBoxFooterDiv.className = "box-footer";
            let cancelButton = document.createElement("a");
            cancelButton.href = "javascript:void(0);";
            cancelButton.className = "btn btn-default btn-sm pull-right m-l-5 box-btn";
            cancelButton.innerText = "Cancel";
            let self = this;
            cancelButton.onclick = function () {
                let element = document.getElementById(self.alertBoxId);
                let bodyElement = document.body;
                bodyElement.style = "overflow:auto;";
                element.parentNode.removeChild(element);
            };
            alertBoxFooterDiv.appendChild(cancelButton);
            let confirmButton = document.createElement("a");
            confirmButton.href = "javascript:void(0);";
            confirmButton.className = "pull-right btn btn-sm box-btn" + ((options.confirmButtonClass != "undefined") ? options.confirmButtonClass : "btn-danger");
            confirmButton.innerText = (options.confirmButtonText != "undefined") ? options.confirmButtonText : "Yes, delete it!";
            confirmButton.onclick = options.confirmButtonAction;

            alertBoxFooterDiv.appendChild(confirmButton);
            alertBoxDiv.appendChild(alertBoxFooterDiv);
            alertDiv.appendChild(alertBoxDiv);
            let bodyElement = document.body;
            bodyElement.appendChild(alertDiv);
            bodyElement.style = "overflow:hidden;";
        },
        removeAlertBox() {
            let element = document.getElementById(this.alertBoxId);
            let bodyElement = document.body;
            bodyElement.style = "overflow:auto;";
            element.parentNode.removeChild(element);
        },
        loaderOpen(message) {
            document.body.style.cursor = "wait";
            let loaderDiv = document.createElement("div");
            loaderDiv.setAttribute('id', this.loaderId);
            loaderDiv.className = "loader-overlay";
            let loaderChildDiv = document.createElement("div");
            let icon = document.createElement("i");
            icon.className = "fa fa-spinner fa-pulse fa-5x";
            let newLine = document.createElement("br");
            let heading = document.createElement("h2");
            heading.innerHTML = message;
            loaderChildDiv.appendChild(icon);
            loaderChildDiv.appendChild(newLine);
            loaderChildDiv.appendChild(heading);
            loaderDiv.appendChild(loaderChildDiv);
            let bodyElement = document.body;
            bodyElement.appendChild(loaderDiv);
        },
        loaderClose() {
            let element = document.getElementById(this.loaderId);
            element.parentNode.removeChild(element);
            document.body.style.cursor = "default";
        },
        handleApiResponse: function (apiResponse, scope = null) {
            let response = apiResponse.body;
            if (response !== null && typeof response !== 'undefined' && typeof response === "object" && Object.keys(response).length > 0) {
                if (response.status === true) {
                    return response;
                } else if (response.status === false) {
                    let error = response.error;
                    if (error !== null && typeof error !== 'undefined') {
                        if (typeof error === "string") {
                            this.snackbar({
                                icon: " <i class='fa fa-check-square-o alert-text-white'></i> ",
                                message: " <span class='alert-text-white'> " + error + " </span>",
                                type: "error",
                            });
                        } else if (response.errorCode == "UVE" && typeof error === "object" && Object.keys(error).length > 0) {
                            let i = 0;
                            for (var field in error) {
                                this.errors.items.push({
                                    field: field,
                                    id: ++i,
                                    msg: error[field],
                                    rule: "required",
                                    scope: scope,
                                    vmId: this.errors.vmId,
                                });
                            }
                        }
                    }
                    return false;
                } else {
                    return false;
                }
            }
        },
        handleExceptions: function (error) {
            if (typeof error === "string") {
                this.toastOption.message = error;
                this.toastOption.duration = 5000;
                this.toastOption.type = "is-danger";
                this.toast();
                return false;
            }
        },
        getNextOffset: function (totalRows, offset, perPage = 3) {
            if (offset < totalRows) {
                let remainingOffset = totalRows - perPage;
                if (remainingOffset > 0 && remainingOffset > offset) {
                    return offset + perPage;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        },
        randomString: function (length) {
            let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = "";
            for (let i = length; i > 0; --i)
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            return result;
        },
        frontEndDateFormat: function (date) {
            var mydate = new Date(date);
            return ("0" + (mydate.getMonth() + 1)).slice(-2) + "/" + ("0" + (mydate.getDate())).slice(-2) + "/" + mydate.getFullYear();
        },
        backEndDateFormat: function (date) {
            var mydate = new Date(date);
            return mydate.getFullYear() + "-" + ("0" + (mydate.getMonth() + 1)).slice(-2) + "-" + ("0" + (mydate.getDate())).slice(-2);
        },
        isObject: function (object) {
            return (object !== "undefined" && object !== null && typeof object === "object");
        },
        isNonEmptyObject: function (object) {
            return (object !== "undefined" && object !== null && typeof object === "object" && Object.keys(object).length > 0);
        },
        popArray: function (array, value) {
            let index = array.indexOf(value);
            if (index > -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
        },
        inArray: function (array, value) {
            return (array.length > 0 && array.indexOf(value) > -1) ? true : false;
        },
        getProfileImage(path) {
            if (path != null) {
                return path;
            } else {
                return baseURL + 'public/assets/images/unknown.png';
            }
        },

        selectTextForCopy: function (element){
            var range;
            if (document.selection) {
                range = document.body.createTextRange();
                range.moveToElementText(element);
                range.select();
            } else if (window.getSelection) {
                range = document.createRange();
                range.selectNode(element);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            }
        },


    },
    watch: {}
});

Vue.filter('toUpperCase', function (value) {
    if (!value)
        return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1)
});
Vue.filter('frontendFullDate', function (value) {
    if (!value)
        return '';
    let mydate = new Date(value);
    let month = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
    return ("0" + (mydate.getDate())).slice(-2) + "-" + month + "-" + mydate.getFullYear();
});
Vue.filter('frontendPeriodTime', function (time) {
    if (!time)
        return '';
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
        time = time.slice(1);
        time[3] = +time[0] < 12 ? ' AM' : ' PM';
        time[0] = +time[0] % 12 || 12;
    }
    return time.join('');
});
Vue.filter('roundToTwo', function (num) {
    if (!num)
        return '';
    return  (Math.round( num * 10 ) / 10);
   // return +(Math.round(num + "e+2") + "e-2");
});
Vue.filter('spaceToDash', function (str) {
    if (!str)
        return '';
    return str.replace(/\s/g, "-");
});
Vue.filter('subStrStrng', function (str, start, end) {
    if (!str)
        return '';
    return str.substring(start, end);
});






