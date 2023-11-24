# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'credentials_dialog.ui'
##
## Created by: Qt User Interface Compiler version 5.15.2
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide2.QtCore import *
from PySide2.QtGui import *
from PySide2.QtWidgets import *


class Ui_Credentials_Dialog(object):
    def setupUi(self, Credentials_Dialog):
        if not Credentials_Dialog.objectName():
            Credentials_Dialog.setObjectName(u"Credentials_Dialog")
        Credentials_Dialog.resize(327, 194)
        self.verticalLayout = QVBoxLayout(Credentials_Dialog)
        self.verticalLayout.setObjectName(u"verticalLayout")
        self.prompt_label = QLabel(Credentials_Dialog)
        self.prompt_label.setObjectName(u"prompt_label")
        self.prompt_label.setWordWrap(True)

        self.verticalLayout.addWidget(self.prompt_label)

        self.gridLayout = QGridLayout()
        self.gridLayout.setObjectName(u"gridLayout")
        self.label_3 = QLabel(Credentials_Dialog)
        self.label_3.setObjectName(u"label_3")

        self.gridLayout.addWidget(self.label_3, 0, 0, 1, 1)

        self.username_lineEdit = QLineEdit(Credentials_Dialog)
        self.username_lineEdit.setObjectName(u"username_lineEdit")

        self.gridLayout.addWidget(self.username_lineEdit, 0, 1, 1, 1)

        self.label = QLabel(Credentials_Dialog)
        self.label.setObjectName(u"label")

        self.gridLayout.addWidget(self.label, 1, 0, 1, 1)

        self.password_lineEdit = QLineEdit(Credentials_Dialog)
        self.password_lineEdit.setObjectName(u"password_lineEdit")
        self.password_lineEdit.setInputMask(u"")
        self.password_lineEdit.setText(u"")
        self.password_lineEdit.setEchoMode(QLineEdit.Password)

        self.gridLayout.addWidget(self.password_lineEdit, 1, 1, 1, 1)

        self.label_2 = QLabel(Credentials_Dialog)
        self.label_2.setObjectName(u"label_2")

        self.gridLayout.addWidget(self.label_2, 2, 0, 1, 1)

        self.token_lineEdit = QLineEdit(Credentials_Dialog)
        self.token_lineEdit.setObjectName(u"token_lineEdit")
        self.token_lineEdit.setInputMask(u"")
        self.token_lineEdit.setText(u"")
        self.token_lineEdit.setEchoMode(QLineEdit.Password)

        self.gridLayout.addWidget(self.token_lineEdit, 2, 1, 1, 1)


        self.verticalLayout.addLayout(self.gridLayout)

        self.buttonBox = QDialogButtonBox(Credentials_Dialog)
        self.buttonBox.setObjectName(u"buttonBox")
        self.buttonBox.setOrientation(Qt.Horizontal)
        self.buttonBox.setStandardButtons(QDialogButtonBox.Cancel|QDialogButtonBox.Ok)

        self.verticalLayout.addWidget(self.buttonBox)

        QWidget.setTabOrder(self.username_lineEdit, self.password_lineEdit)
        QWidget.setTabOrder(self.password_lineEdit, self.token_lineEdit)

        self.retranslateUi(Credentials_Dialog)
        self.buttonBox.accepted.connect(Credentials_Dialog.accept)
        self.buttonBox.rejected.connect(Credentials_Dialog.reject)

        QMetaObject.connectSlotsByName(Credentials_Dialog)
    # setupUi

    def retranslateUi(self, Credentials_Dialog):
        Credentials_Dialog.setWindowTitle(QCoreApplication.translate("Credentials_Dialog", u"eGuard Login", None))
        self.prompt_label.setText(QCoreApplication.translate("Credentials_Dialog", u"Please enter your eGuard credentials.  If required, include the current 2FA token.", None))
        self.label_3.setText(QCoreApplication.translate("Credentials_Dialog", u"Username", None))
        self.label.setText(QCoreApplication.translate("Credentials_Dialog", u"Password", None))
        self.label_2.setText(QCoreApplication.translate("Credentials_Dialog", u"2FA token", None))
    # retranslateUi

