---
layout: blog-post
title:  "Kappa Architecture on Bluemix"
location: Winchester, UK
categories: blog
date:   2017-01-04 09:00:00 +0000
date_written:   2017-01-04 09:00:00 +0000
excerpt: Over the last three years I've been responsible for helping the US Masters, Roland Garros and primarily Wimbledon understand how people are engaging with the events on social media. Their requirements have led to a messy combination of stream processing, batch processing and static indexing. I've started to look at how a Kappa architecture might help us produce a cleaner solution.
---
# Kappa Architecture on Bluemix

*Over the last three years I've been responsible for helping the US Masters, Roland Garros and primarily Wimbledon understand how people are engaging with the events on social media. Their requirements have led to a messy combination of stream processing, batch processing and static indexing. I've started to look at how a [Kappa architecture](http://milinda.pathirage.org/kappa-architecture.com/) might help us produce a cleaner solution.*

All three sports events are transient in the level of interest they attract, a high volume of activity over a short period of time (1-2 weeks), before receding to a low background level. It is important to each event that the analysis of social media be done in realtime – giving their media teams the opportunity to react to what is being said. They also need to be able to access historical analysis in order to put what is happening now in context.

The data analysis requirements are therefore: large volume of messages (~30 million), realtime analysis and historical analysis.

*While data processing for streamed (realtime) and batch (historical) data are well understood, solved problems. The crux of the challenge here is in combining both.*

## Lambda Architecture Option
[Lambda architectures](https://en.wikipedia.org/wiki/Lambda_architecture) have gone someway to address this problem, they still have stream and batch processes, but allow the same code to be used in both, reducing development and maintenance cost. [Apache Spark](http://spark.apache.org/) can be used in this way (it was the solution we used for the 2016 sports events). It is a good option, but had some limitations in our case.

The design for our application's user interface did not distinguish between historic and realtime analysis. The initial view was of realtime analysis, but a user could scroll back in time, seamlessly switching between stream and batch analytics. With careful timing this switch could have been made to work, but the coordination between the two processing functions and the user interface would have been complex and error-prone.

## Stream and Store as a Fudge
Our solution for 2016 was something of a fudge, albeit a pragmatic one. We processed all the data in realtime but stored the results by time snapshots in an Elastic Search index. All data displayed in the UI was served from these static snapshots, meaning the 'realtime' data was not truly realtime, but just the latest snapshot. These were made every 30 seconds, which was as close to realtime as the users required.

Though this solution did its job, it was not one we were happy with. For other applications 30 seconds might matter. It also made it difficult for us to change the analysis. If we improved an algorithm, we had to reprocess all the data. The only way to do this was to replay existing content as if it were new (at the same time as genuinely new content was arriving) and output the results to a second Elastic Search index – the sort of coordination mess we were looking to avoid in the first place. This re-analysis chaos meant we were loathe to run any reprocessing.

## Kappa Architecture
Given this background I was searching for a cleaner solution when I came across the idea of a [Kappa architecture](http://milinda.pathirage.org/kappa-architecture.com/). This architecture makes use of an immutable, append only log to store data. Processing is always done through streaming, but using a log as the data source means you can specify the position to begin from. Only care about realtime? Start at the end of the log. Need to analyse all the data? Move to the front of the log and process to the end. The idea with Kappa is that we have the tools and compute resources to process data so quickly that we can always process the full set, rather than storing a current value and processing transactions on it like we would do in a traditional database.

We were already using IBM Bluemix for the sports events analysis and it has its own immutable, append only log, [Message Hub](https://developer.ibm.com/messaging/message-hub/) (a managed instance of [Apache Kafka](https://kafka.apache.org/)). Looking towards 2017 I set out to prototype a Kappa architecture on Bluemix.

*I wanted to build a framework that would abstract the details of the Kappa Architecture away. I wanted developers to be able to run Elastic Search-like queries and not worry if the data was being processed in batch, stream or a combination of the two. The system should give them a result and automatically update that result if and when the underlying data changed.*

## Kappa Bluemix Prototype
The prototype I developed allows users to send queries via a HTTP Post message. They are returned a URL to a websocket which will push the results to them. There is no ‘final result’ in Kappa Bluemix - there is always an expectation that more data will arrive.

That there is no distinction between batch and streaming data queries has simplified things for the developer, but there is a performance hit. Having to process the whole log, even for a simple query presents a huge overhead compared to a traditional indexed database. With the prototype I've made some effort to mitigate this. Kappa Bluemix shares queries. If two or more users submit identical queries, the second query uses the same output (and subsequent updates) as the first. This form of streaming cache minimises the overhead for common queries, though does nothing for new ones.

The initial performance penalty of a new query is visible to the user in the time taken to return an answer, but once processing has caught up to the end of the log it's just as efficient as regular stream processing.

## Future Direction
A lot of work needs to be done before this prototype could be used for real.

There's currently no way to run a query in a distributed mode, but there is no reason why map-reduce styled programming could not be used. Without this, the system will never be fast enough for interactive applications.

I need to investigate if the architecture has any side effects on Message Hub. I'm not aware of any, but the way I have lots of connects and disconnects, multiple consumers with dynamically generated group IDs and continual resetting to the front of the queue is different to how Message Hub would normally be used. I'm wary of any unintended consequences.

I would also like to implement the prototype in [OpenWhisk](https://developer.ibm.com/open/openprojects/openwhisk/) – it's currently Java based. OpenWhisk is an appealing platform given that the system's compute demands are likely to be spiky.

One side effect of the architecture that I've come to appreciate is that you are effectively creating persistent queries. If I post a query to count the number of records with the name, 'fred', I'll be returned the answer now, but assuming I leave the websocket open, that answer will be updated if the data changes. This can simplify UI code significantly. A developer doesn't have to code to get an answer and then check for updates, it's all one query. This shares lot of the simplicity inherent in [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming). This kind of persistent query would be prohibitively expensive using a traditional database, but with Kappa you get it free. I've come to think that above the cleanliness and simplicity of the processing, this may be the real benefit in this architecture.

## Try It Out
If you'd like to have a play with what I've been working on, please [download](https://ibmets.github.io/kappa-bluemix/) the example from the Emerging Technology [github pages](https://github.com/ibmets/kappa-bluemix) and please [get in touch](mailto:shawdm@gmail.com), I'd welcome any input, ideas, suggestions or criticism.
