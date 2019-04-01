<template>
    <div id="app" class="vh-100">
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
            <span class="navbar-brand mb-0 h1">医療費管理</span>
        </nav>
        <div class="container vh-100 bg-light">
            <div class="row">
                <div class="col-md-6">
                    <h3><strong>医療費入力</strong></h3>
                    <hr>
                    <div class="row form-group">
                        <label for="treatment_date" class="col-3 col-form-label text-right">治療日</label>
                        <div class="col">
                            <input type="text" class="form-control" name="treatment_date" id="treatment_date" placeholder="治療日" v-model="treatment_date">
                        </div>
                    </div>
                    <div class="row form-group">
                        <label for="patient_user_code" class="col-3 col-form-label text-right">患者</label>
                        <div class="col">
                            <select class="form-control" name="patient_user_code" id="patient_user_code" v-model="patient_user_code">
                                <option value=""></option>
                                <option v-for="user in users" :key="user.USER_CODE" :value="user.USER_CODE">{{ user.LAST_NAME + ' ' + user.FIRST_NAME }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="row form-group">
                        <label for="medical_code" class="col-3 col-form-label text-right">医療機関</label>
                        <div class="col">
                            <input type="text" class="form-control" name="medical_name" id="medical_name" list="medical_list" placeholder="医療機関名" v-model="medical_name" @change="changeMedicalInstitution" @keypress.enter="prepareConfirm" @keyup.enter="getMedicalList">
                            <datalist id="medical_list">
                                <option v-for="medical in medical_list" :key="medical.MEDICAL_CODE" :value="medical.MEDICAL_NAME"></option>
                            </datalist>
                            <input type="hidden" name="medical_code" id="medical_code" :value="medical_code">
                        </div>
                    </div>
                    <div class="row form-group">
                        <lable for="payment_code" class="col-3 col-form-label text-right">支払方法</lable>
                        <div class="col">
                            <select class="form-control" name="payment_code" id="payment_code" v-model="payment_code">
                                <option value=""></option>
                                <option v-for="payment in payment_list" :key="payment.PAYMENT_CODE" :value="payment.PAYMENT_CODE">{{ payment.PAYMENT_NAME }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="row form-group">
                        <label for="burden_amount" class="col-3 col-form-label text-right">窓口支払額</label>
                        <div class="col">
                            <input type="text" class="form-control" name="burden_amount" id="burden_amount" placeholder="窓口支払額" v-model="burden_amount">
                        </div>
                    </div>
                    <div class="row mt-4 mb-4">
                        <div class="col-3 offset-6">
                            <button type="button" class="btn btn-block btn-outline-secondary">クリア</button>
                        </div>
                        <div class="col-3">
                            <button type="button" class="btn btn-block btn-primary" @click="registData">登録</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h5>入力履歴</h5>
                    <table class="table table-dark table-striped table-bordered table-sm small">
                        <thead>
                            <tr class="text-center">
                                <th class="font-weight-normal">治療日</th>
                                <th class="font-weight-normal">患者</th>
                                <th class="font-weight-normal">医療機関</th>
                                <th class="font-weight-normal">支払方法</th>
                                <th class="font-weight-normal">窓口支払額</th>
                            </tr>
                        </thead>
                        <tbody v-if="inputHistoryData.count === 0">
                            <tr>
                                <td colspan="5">入力履歴はありません</td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr v-for="data in inputHistoryData.list" :key="data.TREATMENT_DATE">
                                <td>{{ data.TREATMENT_DATE }}</td>
                                <td>{{ data.PATIENT_USER_NAME }}</td>
                                <td>{{ data.MEDICAL_NAME }}</td>
                                <td>{{ data.PAYMENT_NAME }}</td>
                                <td class="text-right">{{ data.BURDEN_AMOUNT }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        <div class="background"></div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "app"
    , components: {}
    , data () {
        return {
            treatment_date: ''
            , patient_user_code: ''
            , medical_code: ''
            , medical_name: ''
            , payment_code: ''
            , burden_amount: ''
            , users: {}
            , medical_list: {}
            , payment_list: {}
            , readyConfirm: false
            , inputHistoryData: {
                count: 0
                , list: {}
            }
        }
    }
    , mounted () {
        axios.get('/db/user')
            .then(function (response) {
                this.users = response.data;
            }.bind(this))
            .catch(function (error) {
                this.users = {};
            }.bind(this));

        axios.get('/db/payment_method')
            .then(function (response) {
                this.payment_list = response.data;
            }.bind(this))
            .catch(function (error) {
                this.payment_list = {};
            }.bind(this));

        this.getMedicalExpenses();
    }
    , methods: {
        prepareConfirm () {
            this.readyConfirm = true;
        }
        , getMedicalList () {
            if (!this.readyConfirm) {
                return false;
            }

            axios.post(
                '/db/medical_institution'
                , {
                    medical_name_like: this.medical_name
                }
            )
            .then(function (response) {
                this.medical_list = response.data;
            }.bind(this))
            .catch(function (error) {
                this.medical_list = {};
                console.error(error.message);
            }.bind(this));
        }
        , changeMedicalInstitution () {
            axios.post(
                '/db/medical_institution'
                , {
                    medical_name: this.medical_name
                }
            )
            .then(function (response) {
                this.medical_code = response.data[0].MEDICAL_CODE;
            }.bind(this))
            .catch(function (error) {
                this.medical_code = '';
            }.bind(this));
        }
        , registData () {
            axios.post(
                '/db/regist'
                , {
                    treatment_date: this.treatment_date
                    , patient_user_code: this.patient_user_code
                    , medical_code: this.medical_code
                    , payment_code: this.payment_code
                    , burden_amount: this.burden_amount
                }
            )
            .then((response) => {
                alert('登録しました！');
                this.getMedicalExpenses();
            })
            .catch((error) => {
                console.error(error.message);
            });
        }
        , getMedicalExpenses () {
            axios.post(
                '/db/getMedicalExpenses'
                , {
                    dataLimitMax: 15
                    , dataSort: 'DESC'
                }
            )
            .then((response) => {
                if (response.data.result) {
                    this.inputHistoryData.count = response.data.count;
                    this.inputHistoryData.list = response.data.list;
                } else {
                    this.inputHistoryData.count = 0;
                    this.inputHistoryData.list = {};
                }
            })
            .catch((error) => {
                alert(error);
            });
        }
    }
};
</script>

<style scoped>
#app {
    position: relative;
}

.container {
    position: relative;
    z-index: 100;
    padding-top: 6em;
    box-shadow: 0 0 40px #444444;
}

.background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
    z-index: 1;
    background-image: url('./assets/input_bg_img.jpg');
    background-size: cover;
}
</style>
