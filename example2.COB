       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXAMPLE2.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT OLD-FILE ASSIGN TO DISK1
           ORGANIZATION IS SEQUENTIAL
           ACCESS MODE  IS SEQUENTIAL
           FILE STATUS  IS WS-FS-OLD.
           SELECT NEW-FILE ASSIGN TO DISK2
           ORGANIZATION IS SEQUENTIAL
           ACCESS MODE  IS SEQUENTIAL
           FILE STATUS  IS WS-FS-NEW.
           SELECT OLD-FILE ASSIGN TO DISK1
           ORGANIZATION IS SEQUENTIAL
           ACCESS MODE  IS SEQUENTIAL
           FILE STATUS  IS WS-FS-PARM.

       DATA DIVISION.
       FILE SECTION.
       FD  OLD-FILE
           RECORD CONTAINS 80 CHARACTERS.
       FD  NEW-FILE
           RECORD CONTAINS 80 CHARACTERS.
       FD  PARM-FILE
           RECORD CONTAINS 80 CHARACTERS.
       WORKING-STORAGE SECTION.
       77  WS-FS-OLD                   PIC X(02).
       77  WS-FS-NEW                   PIC X(02).
       77  WS-FS-PARM                  PIC X(02).
       01  WS-PARAMETERS.
           05 WS-PARM-CATEGORY         PIC X(10).
           05 WS-PARM-RATE             PIC 99.99.
       77  WS-TABLE-LIMIT  VALUE 200   PIC 999.
       01  WS-RATE-TABLE.
           05 WS-RATE-ROW              PIC X(10) OCCURS 200 TIMES.
              10 WS-TBL-CATEGORY       PIC X(10).
              10 WS-TBL-RATE           PIC 99.99.
       77  WS-INDEX                    PIC 999.
       01  WS-CUST-RECORD.
           05 WS-CUST-ID               PIC XX9999.
           05 WS-CUST-NAME             PIC X(20).
           05 WS-CUST-BALANCE          PIC 99999.99.
           05 WS-CUST-LIMIT            PIC 99999.99.
           05 WS-CUST-STATUS           PIC X(10).
           05 WS-CUST-CATEGORY         PIC X(10).
           05 WS-CUST-RATE             PIC 99.99.
           05 WS-CUST-PAYMENT-HISTORY  PIC 999.
           05 FILLER                   PIC X(10).

       PROCEDURE DIVISION.
       A001-INIT.
           OPEN INPUT  OLD-FILE.
           OPEN OUTPUT NEW-FILE.
           OPEN INPUT  PARM-FILE.
           PERFORM A002-LOAD-TABLE.
           CLOSE PARM-FILE.
           GO TO A003-GET-CUST-RECORD.
       A002-LOAD-TABLE.
           PERFORM
               READ PARM-FILE INTO WS-PARAMETERS
                   AT END EXIT PERFORM
               ADD 1 to WS-INDEX
               IF WS-INDEX > WS-TABLE-LIMIT THEN
                   DISPLAY "TABLE LOAD ERROR"
                   STOP RUN
               END-IF
               MOVE WS-PARAMETERS TO WS-RATE-ROW(WS-INDEX)
           END-PERFORM.
       A003-GET-CUST-RECORD.
           READ OLD-FILE INTO WS-CUST-RECORD
               AT END GO TO A008-TERM.
       A004-CHECK-LIMIT.
           IF WS-CUST-STATUS="SUSPEND" THEN
               IF WS-CUST-BALANCE <= WS-CUST-LIMIT THEN
                   MOVE "ACTIVE" TO WS-CUST-STATUS
               END-IF
           ELSEIF WS-CUST-BALANCE GREATER THAN WS-CUST-LIMIT THEN
               MOVE "SUSPEND" TO WS-CUST-STATUS
           END-IF.
       A005-CHECK-PMT-HISTORY.
           EVALUATE TRUE
               WHEN WS-CUST-PAYMENT-HISTORY > .90
                   WS-CUST-CATEGORY = "PREFERRED"
               WHEN WS-CUST-PAYMENT-HISTORY > .60
                   WS-CUST-CATEGORY = "REGULAR"
               WHEN WS-CUST-PAYMENT-HISTORY > .30
                   WS-CUST-CATEGORY = "MARGINAL"
               WHEN OTHER
                   WS-CUST-CATEGORY = "DECLINED"
           END-EVALUATE.
       A006-SET-RATE.
           SEARCH WS-TABLE
               VARYING WS-INDEX
               AT END DISPLAY "TABLE SEARCH ERROR"
               WHEN WS-TBL-CATEGORY(WS-INDEX) = WS-CUST-CATEGORY
               WS-CUST-RATE = WS-TBL-RATE(WS-INDEX)
           END-SEARCH.
       A007-PUT-CUST-RECORD.
           WRITE NEW-FILE FROM WS-CUST-RECORD.
           GO TO A003-GET-CUST-RECORD.
       A008-TERM.
           CLOSE OLD-FILE.
           CLOSE NEW-FILE.
           STOP RUN.
