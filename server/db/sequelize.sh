####################### FILES START #############################################
#--------------------------------------------- Migration Organization ---------------------------------------
npx sequelize-cli model:generate --name OrgType --underscored true --attributes name:string,is_active:boolean
npx sequelize-cli model:generate --name Organization --underscored true --attributes name:string,description:text,org_type_id:integer,company_logo_file_id:integer,email:string,phone:string,is_active:boolean,is_verified:boolean,payment_id:integer
# Updated 13 June 2020
npx sequelize-cli migration:generate --name add-subscription_id-organizations

#--------------------------------------------- Migration Users ---------------------------------------
npx sequelize-cli model:generate --name User --underscored true --attributes first_name:string,last_name:string,email:string,profile_picture_file_id:integer,user_type:string,org_id:integer,title:string,phone:string,last_login_date:date,login_attempts:integer,stripe_customer_id:string,stripe_card_id:string,status:string,is_verified:boolean
npx sequelize-cli model:generate --name UserPassword --underscored true --attributes user_id:integer,password:text

#--------------------------------------------- Migration Email Log ---------------------------------------
npx sequelize-cli model:generate --name EmailLog --underscored true --attributes email_type:string,email_to:string,params:text,sent:boolean,errors:text

#--------------------------------------------- Migration Subscription & Payment ---------------------------------------
npx sequelize-cli model:generate --name SubscriptionPlan --underscored true --attributes plan_type:string,plan_name:string,duration:integer,duration_unit:string,amount:float,sequence:integer
# Updated 13 June 2020
npx sequelize-cli migration:generate --name add-subscription_plan_id-SubscriptionPlans

npx sequelize-cli model:generate --name Payment --underscored true --attributes user_id:integer,org_id:integer,stripe_customer_id:integer,source_id:integer,stripe_card_id:string,subscription_plan_id:integer,payment_type:string
# Updated 13 June 2020
npx sequelize-cli migration:generate --name add-subscription-Payment

#--------------------------------------------- Migration File ---------------------------------------
npx sequelize-cli model:generate --name File --underscored true --attributes name:string,extension:text,image_sizes:text,file_size:integer,metadata:text,mime_type:string,location:text,storage_type:string,content:blob

#--------------------------------------------- Migration Notification Device ---------------------------------------
npx sequelize-cli model:generate --name NotificationDevice --underscored true --attributes user_id:integer,registration_id:text,uuid:string,platform:string,is_active:boolean

#--------------------------------------------- Migration ForeignKeys ---------------------------------------
npx sequelize-cli migration:generate --name add-fk-associations

#--------------------------------------------- Migration Email Templates ---------------------------------------
npx sequelize-cli model:generate --name EmailBaseTemplate --underscored true --attributes name:string,format:string,content:text
npx sequelize-cli model:generate --name EmailContentTemplate --underscored true --attributes name_id:string,base_template_id:integer,subject_template:text,content_template:text

#--------------------------------------------- Receipt Info -----------------------------------------------------
npx sequelize-cli model:generate --name ReceiptCategory --underscored true --attributes label:string,value:string,sequence:integer
npx sequelize-cli model:generate --name PaymentType --underscored true --attributes label:string,value:string,sequence:integer
npx sequelize-cli model:generate --name ReceiptAmount --underscored true --attributes tax_percentage:float,net:float,tax:float,sum:float
npx sequelize-cli model:generate --name Receipt --underscored true --attributes company_name:string,receipt_file_id:integer,invoice_date:date,receipt_number:string,company_payment:boolean,note:text,category_id:integer,lifelong_warranty:boolean,warranty_unit_id:integer,warranty_value:integer,unlimited_return:boolean,return_unit_id:integer,return_value:integer,paid_with_id:integer
npx sequelize-cli model:generate --name DurationUnit --underscored true --attributes label:string,value:string,sequence:integer

####################### FILES END #############################################

####################### SEEDERS START #############################################
npx sequelize-cli seed:generate --name add-default-company
npx sequelize-cli seed:generate --name add-default-subscriptionPlans

npx sequelize-cli seed:generate --name add-default-emailTemplates

####################### SEEDERS END #############################################

####################### NOTES & COMMANDS #############################################


#  Naming conventions:
#  Add columns: add-<column names>-<Table Name>
#  Remove Columns: rm-<column names>-<Table Name>
#  Update Columns: update-<column names>-<Table Name>
#  Add constraint: add-<fk or index>-<Table Name>
#  Remove constraint: rm-<fk or index>-<Table Name>
#  Update constraint: update-<fk or index>-<Table Name>
# npx sequelize-cli migration:generate --name <Follow above naming convention>

#--------------- Seeder Migration generator ----------------
# npx sequelize-cli seed:generate --name demo-user
# npx sequelize-cli db:seed:all



# Sequelize CLI [Node: 10.15.0, CLI: 5.5.0, ORM: 5.11.0]

# npx sequelize [command]

# Commands:
#   sequelize db:migrate                        Run pending migrations
#   sequelize db:migrate:schema:timestamps:add  Update migration table to have timestamps
#   sequelize db:migrate:status                 List the status of all migrations
#   sequelize db:migrate:undo                   Reverts a migration
#   sequelize db:migrate:undo:all               Revert all migrations ran
#   sequelize db:seed                           Run specified seeder
#   sequelize db:seed:undo                      Deletes data from the database
#   sequelize db:seed:all                       Run every seeder
#   sequelize db:seed:undo:all                  Deletes data from the database
#   sequelize db:create                         Create database specified by configuration
#   sequelize db:drop                           Drop database specified by configuration
#   sequelize init                              Initializes project
#   sequelize init:config                       Initializes configuration
#   sequelize init:migrations                   Initializes migrations
#   sequelize init:models                       Initializes models
#   sequelize init:seeders                      Initializes seeders
#   sequelize migration:generate                Generates a new migration file       [aliases: migration:create]
#   sequelize model:generate                    Generates a model and its migration  [aliases: model:create]
#   sequelize seed:generate                     Generates a new seed file            [aliases: seed:create]

# Options:
#   --version  Show version number                                         [boolean]
#   --help     Show help                                 
####################### END NOTES & COMMANDS  #############################################
