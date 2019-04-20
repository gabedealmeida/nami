![Nami Header](https://i.imgur.com/kZhANSb.png?1)

Nami is a serverless framework for consuming webhooks at scale.

When webhooks are generated by batched events, consumers may be overwhelmed by a deluge of webhook data resulting in thousands of requests per second. With a traditional architecture, this data can be processed by deploying an application across a cluster of always-on servers. This is an inefficient use of resources given the unpredictable bursts of traffic.

The Nami framework accommodates a large wave of webhooks using AWS Lambda Functions as a Service (FaaS), which dynamically scales computing resources to match the flow of incoming data. Nami then throttles the flow using an SQS queue as message broker to send the data to a MongoDB data store deployed using Docker on an EC2 instance.

![Nami components](https://i.imgur.com/rSj8dkE.png)

## The Team
**Sachin Chandy** *Software Engineer* London, UK

**Wendy Kuhn** *Software Engineer* Austin, TX

**Nick Miller** *Software Engineer* Los Angeles, CA

## Getting Started

### Prerequisites
* AWS account
* AWS CLI
* Node.js >= 8.10
* NPM

Nami requires that users have an account with AWS and have set up the AWS CLI on their local machine.  If you have not already done so, please visit [Configuring the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) for instructions.  Nami will use the account number and region specified within that profile in order to interact with AWS services.

### Install Nami
``` bash
npm install -g nami-serverless
```
---

## Commands

Nami commands conform to the following structure:
```
nami <commandName> [<resourceName>]
```

---

#### `nami deploy <resourceName>`
*deploys API endpoint to register with webhook provider and accompanying scalable architecture*

The `deploy` command will create instances of the below:
- API Gateway resource
- SQS Queue (with dead letter queue attached)
- Pre and post-queue Lambda functions
- EC2 instance with MongoDB deployed using Docker

The first time the `deploy` command is run, Nami will also create:
- a hidden directory within the user's home directory that holds configuration files and serves as a staging directory for deploying the Lambda functions
- roles for the Lambda functions


---

#### `nami create <resourceName>`
*creates local directories and files for pre-queue and post-queue Lambda functions for user to insert custom logic before deploying*

---

#### `nami destroy <resourceName>`
*deletes API endpoint to register with webhook provider and accompanying scalable architecture*

All instances of AWS services for a particular endpoint will be deleted, except for the Elastic Block Storage volume that holds any webhook data written to the database.

---

#### `nami list`
*lists active API endpoints*

---

#### `nami help`
*documentation of commands*

---

## Helpful Tips

### Accessing AWS services

The Nami framework deploys instances of multiple AWS services. While these instances can be deleted using the `destroy` command, they can also be accessed and modified using the [AWS CLI](https://docs.aws.amazon.com/cli/index.html) or via the [web console](https://console.aws.amazon.com/console/home).

### At-least once delivery

Due to the AWS services used by Nami and the nature of the HTTP request/response cycle of webhooks, we are unable to guarantee in-order, exactly once delivery of webhook data. Users should be aware of this and either make applications using this data [idempotent](https://en.wikipedia.org/wiki/Idempotence), or filter the webhook data to remove any duplicate messages.

### Security and SSH

![Security Diagram](https://i.imgur.com/Lo7dYMo.png)

To conform to security best practices, the post-queue Lambda function and EC2 instance are both within their own security group to limit outside access. Users can access their own AWS EC2 instances using SSH, however, TCP port 22 is closed by default when users deploy instances of Nami. This can be opened by the user either by using the `authorize-security-group-ingress` [aws cli command](https://docs.aws.amazon.com/cli/latest/reference/ec2/authorize-security-group-ingress.html), or by editing the inbound rules for the `<resourceName>EC2SecurityGroup` to allow SSH connections from your desired source.

### Accessing database

Once port 22 is opened, a user can SSH into the EC2 instance and access their webhook data directly from MongoDB.

1. From the directory with the `nami.pem` keypair file, SSH into the EC2 instance. Instructions on how to do this can be found when clicking the 'Connect' button once the EC2 instance is selected on the web console.
2. Type `yes` when prompted to finish initiating the connection.
3. Type `sudo docker exec -it namiStore bash` to create a new Bash session in the running `namiStore` MongoDB container.
4. Type `mongo nami` to start the Mongo shell with database `nami`.
5. Access your webhook data in `namiCollection`! Common commands include:
  - `db.namiCollection.find()` - retrieves all documents from `namiCollection`
  - `db.namiCollection.count()` - display the number of documents in `namiCollection`
