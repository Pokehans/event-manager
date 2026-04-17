# Datenbankstruktur (V2.0)

## users

* id
* email
* role
* area
* active
* created_at

## events

* id
* title
* status
* date
* company_name
* firstname
* lastname
* address
* phone
* email
* room_id
* adults
* children
* tech
* infrastructure
* schedule
* food
* drinks
* notes
* payment_type
* created_by
* created_at

## event_logs

* id
* event_id
* user_id
* change
* created_at

## event_debriefings

* id
* event_id
* text
* created_at

## rooms

* id
* name
* description

## todos

* id
* user_id
* text
* due_date
* done
