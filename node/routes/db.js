const express = require('express');
const oracledb = require('oracledb');

const router = express.Router();

const connectionProperties = {
    user: 'ACCOUNT'
    , password: 'account'
    , connectString: 'ORCL'
    , stmtCacheSize: 4
    , poolMin: 1
    , poolMax: 5
};

// ユーザ一覧取得
router.get(
    '/user'
    , (req, res, next) => {
        let connection;
        let strText;

        oracledb.getConnection(connectionProperties)
            .then((conn) => {
                connection = conn;
                strText = 'SELECT * FROM M_USER ORDER BY USER_CODE ASC';

                return connection.execute(
                    strText
                    , {}
                    , {
                        outFormat: oracledb.OBJECT
                    }
                );
            })
            .then((result) => {
                doRelease(connection);
                res.send(result.rows);
            })
            .catch((error) => {
                console.error(error.message);

                if (connection != null) {
                    console.error(strText);
                    doRelease(connection);
                }

                res.send(
                    500
                    , {
                        'error': error.message
                    }
                );
            });
    }
);

// 医療機関リスト取得
router.post(
    '/medical_institution'
    , (req, res, next) => {
        let connection;
        let strText;

        oracledb.getConnection(connectionProperties)
            .then((conn) => {
                connection = conn;
                let bindParam = {};
                let medical_name = req.body.medical_name || '%' + req.body.medical_name_like + '%';

                strText = 'SELECT * FROM M_MEDICAL_INSTITUTION';

                if (req.body.medical_name || req.body.medical_name_like) {
                    strText += ' WHERE MEDICAL_NAME ';
                    if (req.body.medical_name) {
                        strText += '=';
                    } else if (req.body.medical_name_like) {
                        strText += 'LIKE';
                    }
                    strText += ' :medical_name';

                    bindParam.medical_name = medical_name;
                }

                strText += ' ORDER BY MEDICAL_NAME ASC';

                return connection.execute(
                    strText
                    , bindParam
                    , {
                        outFormat: oracledb.OBJECT
                    }
                );
            })
            .then((result) => {
                doRelease(connection);
                res.send(result.rows);
            })
            .catch((error) => {
                console.error(error.message);

                if (connection != null) {
                    console.error(strText);
                    doRelease(connection);
                }

                res.send(
                    500
                    , {
                        'error': error.message
                    }
                );
            });
    }
);

// 支払方法一覧取得
router.get(
    '/payment_method'
    , (req, res, next) => {
        let connection;
        let strText;

        oracledb.getConnection(connectionProperties)
            .then((conn) => {
                connection = conn;
                strText = 'SELECT * FROM M_PAYMENT_METHOD ORDER BY PAYMENT_CODE ASC';

                return connection.execute(
                    strText
                    , {}
                    , {
                        outFormat: oracledb.OBJECT
                    }
                );
            })
            .then((result) => {
                doRelease(connection);
                res.send(result.rows);
            })
            .catch((error) => {
                console.error(error.message);

                if (connection != null) {
                    console.error(strText);
                    doRelease(connection);
                }

                res.send(
                    500
                    , {
                        'error': error.message
                    }
                );
            });
    }
);

// 登録・更新処理
router.post(
    '/regist'
    , (req, res, next) => {
        let connection;
        let strText;

        oracledb.getConnection(connectionProperties)
            .then((conn) => {
                connection = conn;

                strText = `SELECT
                            *
                        FROM
                            T_MEDICAL_BILLS
                        WHERE
                            TREATMENT_DATE = :treatment_date
                        AND MEDICAL_CODE = :medical_code
                        AND PATIENT_USER_CODE = :patient_user_code
                        AND BURDEN_AMOUNT = :burden_amount`;

                return connection.execute(
                    strText
                    , {
                        treatment_date: req.body.treatment_date
                        , medical_code: req.body.medical_code
                        , patient_user_code: req.body.patient_user_code
                        , burden_amount: req.body.burden_amount
                    }
                    , {
                        outFormat: oracledb.OBJECT
                    }
                );
            })
            .then((result) => {
                if (result.rows.length > 0) {
                    // 更新処理

                } else {
                    // 登録処理
                    strText = `INSERT INTO
                                T_MEDICAL_BILLS
                            (
                                TREATMENT_DATE
                                , MEDICAL_CODE
                                , PATIENT_USER_CODE
                                , BURDEN_AMOUNT
                                , PAYMENT_CODE
                                , REGIST_USER_CODE
                                , UPDATE_USER_CODE
                            ) VALUES (
                                :treatment_date
                                , :medical_code
                                , :patient_user_code
                                , :burden_amount
                                , :payment_code
                                , :regist_user_code
                                , :update_user_code
                            )`;

                    return connection.execute(
                        strText
                        , {
                            treatment_date: req.body.treatment_date
                            , medical_code: req.body.medical_code
                            , patient_user_code: req.body.patient_user_code
                            , burden_amount: req.body.burden_amount
                            , payment_code: req.body.payment_code
                            , regist_user_code: 10
                            , update_user_code: 10
                        }
                    );
                }
            })
            .then((result) => {
                return connection.commit();
            })
            .then(() => {
                doRelease(connection);
                res.send(200);
            })
            .catch((err) => {
                console.error(err.message);

                if (connection != null) {
                    console.error(strText);
                    doRelease(connection);
                }

                res.send(
                    500
                    , {
                        'error': err.message
                    }
                );
            });
    }
);

// 医療費入力一覧取得
router.post(
    '/getMedicalExpenses'
    , (req, res, next) => {
        let connection;
        let strSql;

        oracledb.getConnection(connectionProperties)
            .then(conn => {
                connection = conn;

                strSql = `SELECT
                            TO_CHAR(TMB.TREATMENT_DATE, 'YYYY/MM/DD') AS TREATMENT_DATE
                            , MU.LAST_NAME || ' ' || MU.FIRST_NAME AS PATIENT_USER_NAME
                            , MMI.MEDICAL_NAME
                            , MPM.PAYMENT_NAME
                            , TMB.BURDEN_AMOUNT
                        FROM
                            T_MEDICAL_BILLS TMB
                        LEFT JOIN
                            M_USER MU
                        ON
                            TMB.PATIENT_USER_CODE = MU.USER_CODE
                        LEFT JOIN
                            M_MEDICAL_INSTITUTION MMI
                        ON
                            TMB.MEDICAL_CODE = MMI.MEDICAL_CODE
                        LEFT JOIN
                            M_PAYMENT_METHOD MPM
                        ON
                            TMB.PAYMENT_CODE = MPM.PAYMENT_CODE
                        ORDER BY`;
                if (req.body.dataSort) {
                    strSql += '   TMB.UPDATE_DATE ' + req.body.dataSort;
                } else {
                    strSql += '   TMB.TREATMENT_DATE DESC';
                }
                strSql += '   , TMB.PATIENT_USER_CODE ASC';
                strSql += '   , TMB.MEDICAL_CODE ASC';
                if (req.body.dataLimitMax) {
                    strSql += 'FETCH FIRST ' + req.body.dataLimitMax + ' ROWS ONLY';
                }

                return connection.execute(
                    strSql
                    , {}
                    , {
                        outFormat: oracledb.OBJECT
                    }
                );
            })
            .then(result => {
                doRelease(connection);
                res.send({
                    result: true
                    , count: result.rows.length
                    , list: result.rows
                });
            })
            .catch(error => {
                console.error(error.message);

                if (connection != null) {
                    console.error(strSql);
                    doRelease(connection);
                }

                res.send(
                    500
                    , {
                        result: false
                        , 'error': error.message
                    }
                );
            });
    }
);

module.exports = router;

function doRelease(connection) {
    connection.release((err) => {
        if (err) {
            console.error(err.message);
       }
    });
}
