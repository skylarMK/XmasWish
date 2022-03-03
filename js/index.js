(function () {
})();
var vm;
var app = {
    el: "#app",
    data() {
        return {
            name: "2020XmasWish",
            id: "",
            apiBaseUrl: "https://event.setn.com/ci",
            cardCurrent: 0,
            allCard: [
                {
                    from:"安娜貝爾",
                    to:"鋼鐵人",
                    message:"一杯熱可可一張毯子，還有你，就是我的美好耶誕夜!",
                    time:"2020-12-25 00:00:00",
                }
            ],
            user: {
                login: false,
                id: "0",
                name: "",
                email: "",
                hasExtraInfo: [],
                token: "",
                hasAgreed: null,
                draw: false,
                share: false,
                reward: false,
                card:{
                    from: "",
                    to: "",
                    message: "",
                }
            },
            /* POPUP | START | CARD | MISS | MISS_AGAIN | WIN */
            dialog: "",
            /* MISS | MISS_AGAIN | WIN */
            DialogDraw: "",
            dialogResultType:["WIN","MISS","MISS_AGAIN","CARD"],

        };
    },
    created() {
        this.getAllCard();
    },
    computed: {
        cardImage() {
            if(this.user.reward == "台灣挑戰者汽車保養TOP1 PLUS 9H SGS雙層鈦塗層")
                return "images/gift1.jpg";
            if(this.user.reward == "日本IRIS PM2.5空氣清淨除濕機 OC-H120")
                return "images/gift2.jpg";
            if(this.user.reward == "A'CHRON極緻尊榮空中SPA")
                return "images/gift3.jpg";
            if(this.user.reward == "鍋寶智慧多功能氣炸烤箱12L")
                return "images/gift4.jpg";
            if(this.user.reward == "【鍋寶SODAMASTER+】萬用氣泡水機")
                return "images/gift5.jpg";
            if(this.user.reward == "TTM 向日葵活力光采乳霜精華")
                return "images/gift6.jpg";
        },
    },
    methods: {
        toggleDialog: function (name) {
            this.dialog = this.dialog == name ? "" : name;
        },
        start: function () {

            if (!vm.registerCheck()){
                return false;
            }
            if (!register()) {
                return false;
            }
            this.postMessage();
            this.draw();
        },
        draw: function () {
            this.reloadMotion();
            this.getRange().then(function(result){
                vm.user.draw = true;
                if(result.data){
                    vm.postDraw();
                }else{
                    vm.DialogDraw = "MISS_AGAIN";
                }
            });
            setTimeout(function () {
                vm.toggleDialog(vm.DialogDraw);
                vm.endMotion();
            }, 2800);
            return false;
        },
        /**
         *  取得訊息資料
         */
        getAllCard: function () {
            return axios({
                method: "get",
                url: this.apiBaseUrl + "/message?limit=5&event=" + this.name,
            }).then(function (response) {
                vm.allCard = response.data;
            }).catch(function (error) {
                console.error(error);
            });
        },
        /**
         * 檢查使用者留言齊全度
         */
        registerCheck: function() {
            if (vm.user.card.from == "") {
                animateCSS('.cardfrom', 'headShake');
                return false;
            }
            if (vm.user.card.to == "") {
                animateCSS('.cardto', 'headShake');
                return false;
            }
            if (vm.user.card.message == "") {
                animateCSS('.cardmessage', 'headShake');
                return false;
            }
            if (!vm.user.hasAgreed) {
                animateCSS('#hasAgreed', 'headShake');
                animateCSS('.labelBox', 'headShake');
                return false;
            }
            return true;
        },
        /**
         * 儲存訊息
         */
        postMessage: function() {

            var form = new FormData();
            form.append("event",this.name);
            form.append("member",this.user.id);
            form.append("from",this.user.card.from);
            form.append("to",this.user.card.to);
            form.append("message",this.user.card.message);
            axios({
                method: "post",
                url: this.apiBaseUrl + "/message",
                data: form,
            }).then(function () {
                vm.getAllCard();
            }).catch(function (error) {
                console.error(error);
                vm.toggleDialog("MISS");
            });

        },
        /**
         * 拋球動畫
         */
        reloadMotion: function () {
            this.toggleDialog("");
            $("html,body").animate({
                scrollTop: 0
            }, 1000);
            $(".ballAnimate").css("display", "none");
            $(".ball0").css("display", "none");
            $(".ballAnimate").css("display", "block");
        },
        /**
         * 結束動畫
         */
        endMotion: function () {
            $(".ballAnimate").css("display", "none");
            $(".ballAnimated").css("display", "block");
        },
        /**
         * 檢查抽獎機會
         */
        getRange: function () {
            return axios({
                method: "get",
                url: this.apiBaseUrl + "/lottery?event=" + this.name + "&" + "member=" + this.user.id,
            }).catch(function (error) {
                console.error(error);
            });
        },
        /**
         * 抽獎
         */
        postDraw:  function () {
            var form = new FormData();
            form.append("event",this.name);
            form.append("member",this.user.id);
            axios({
                method: "post",
                url: this.apiBaseUrl + "/lottery",
                data: form,
            }).then(function (response) {
                vm.user.reward = response.data;
                if (vm.user.reward == false) {
                    if(vm.user.share == false){
                        vm.DialogDraw = "MISS";
                        return false;
                    }else{
                        vm.DialogDraw = "MISS_AGAIN";
                        return false;
                    }
                }else{
                    vm.DialogDraw = "WIN";
                    return false;
                }
            }).catch(function (error) {
                console.error(error);
            });
        },
        FacebookShare: function () {
            facebookMe.target.refer = this.name;
            facebookMe.target.href = "https://acts.setn.com/event/" + this.name +"?utm_source=facebook";
            facebookMe.target.hashtag = "#只要有愛我們就很可愛";
            facebookMe.share();
        }
    },
};

/**
 * 動畫效果
 *
 * @param {string} element
 * @param {string} animation
 * @param {string} prefix
 */
const animateCSS = (element, animation, prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = document.querySelector(element);

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd() {
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });


/**
 * 會員登入
 */
function register() {
    if (!vm.user.token.length) {
        openFacebookRegister();
        return false;
    }
    vm.user.login = true;
    return true;
}

function openFacebookRegister() {
    window.open('https://memberapi.setn.com/Customer/FacebookLoginForEvent?e=' + vm.name, '', config = 'height=800,width=600');
    return true;
}

function callbackFacebookLogin(data) {
    if (data.result !== true) {
        return false;
    }


    vm.user.token = data.GetObject.token;
    $.ajax({
        method: "GET",
        url: "https://event.setn.com/api/user",
        data: { token: vm.user.token },
        dataType: "json",
        context: this,
        success: function (response) {
            vm.user.id = response.fb_id;
            vm.user.name = response.name;
            vm.user.email = response.email;
            vm.user.hasExtraInfo = response.hasExtraInfo;
            vm.start();
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}
$(document).ready(function () {
    if(detectAgent.browser() == "Other"){
        $('.reminderArea').css('display','none');
    }
    if (document.location.protocol == "http:") {
        window.location.replace(window.location.href.replace("http:", "https:"));
    }
    vm = new Vue(app);
    window.addEventListener('message', function (event) {
        // if ((event.origin.indexOf('setn.com') != -1) || (event.origin.indexOf('sanlih.com.tw') != -1) || (event.origin.indexOf('127.0.0.1') != -1)  ) {
        callbackFacebookLogin(event.data);
        // }
    });
});