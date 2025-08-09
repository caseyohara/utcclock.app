let now = new Date()

// Sets the refresh rate for updating `now`.
// A refresh rate of 500 means the clock will be accurate within +/- a half second.
// A rate less than 1000 does not increase the tick frequency of the clock;
// the second hand will still move once per second, but it increases the frequency
// with which the clock syncs its local time with system time, making it more accurate.
const refreshRate = 250 // milliseconds

const tzName = date => {
  return Intl.DateTimeFormat("default", { timeZoneName: "long" }).formatToParts(date).find(part => part.type === "timeZoneName").value
}

const tzAbbr = date => {
  return Intl.DateTimeFormat("default", { timeZoneName: "short" }).formatToParts(date).find(part => part.type === "timeZoneName").value
}

const secondHandSymbol = {
  draw: function(context, length) {
    const baseLength = 180,
      baseLollipopRadius = 10,
      baseLollipopOffset = 86,
      baseCounterWeightLength = 58,
      baseCounterWeightLollipopRadius = 6,
      baseCounterWeightLollipopOffset = 0,
      scale = length / baseLength,
      lollipopRadius = baseLollipopRadius * scale,
      lollipopOffset = baseLollipopOffset * scale,
      counterWeightLength = baseCounterWeightLength * scale,
      counterWeightLollipopRadius = baseCounterWeightLollipopRadius * scale,
      counterWeightLollipopOffset = baseCounterWeightLollipopOffset * scale

    context.moveTo(0, 0)
    context.lineTo(0, lollipopOffset - lollipopRadius)
    context.moveTo(lollipopRadius, lollipopOffset)
    context.arc(0, lollipopOffset, lollipopRadius, 0, Math.PI * 2)
    context.moveTo(0, lollipopOffset + lollipopRadius)
    context.lineTo(0, ((length + counterWeightLength + counterWeightLollipopOffset) - counterWeightLollipopRadius))
    context.moveTo(counterWeightLollipopRadius, (length + counterWeightLength + counterWeightLollipopOffset))
    context.arc(0, (length + counterWeightLength + counterWeightLollipopOffset), counterWeightLollipopRadius, 0, Math.PI * 2)
    if (length + counterWeightLength + counterWeightLollipopOffset + counterWeightLollipopRadius < length + counterWeightLength) {
      context.moveTo(0, length + counterWeightLength + counterWeightLollipopOffset + counterWeightLollipopRadius)
    } else {
      context.moveTo(0, length + counterWeightLength + counterWeightLollipopOffset)
    }
    context.lineTo(0, length + counterWeightLength)
    context.closePath()
  }
}

const minuteHandSymbol = {
  draw: function(context, length) {
    const baseLength = 1024,
      baseTipWidth = 0,
      baseTipLength = 128,
      baseNeckWidth = 72,
      baseWaistWidth = 72,
      baseTailLength = 128,
      baseTailWidth = 0

    const scale = length / baseLength,
      tipWidth = baseTipWidth * scale,
      tipLength = baseTipLength * scale,
      neckWidth = baseNeckWidth * scale,
      waistWidth = baseWaistWidth * scale,
      tailLength = baseTailLength * scale,
      tailWidth = baseTailWidth * scale

    context.moveTo(0, 0)
    context.lineTo(tipWidth / 2,  0)
    context.lineTo(neckWidth / 2, tipLength)
    context.lineTo(waistWidth / 2, length - tailLength)
    context.lineTo(tailWidth / 2,  length)
    context.lineTo(-tailWidth / 2,  length)
    context.lineTo(-waistWidth / 2, length - tailLength)
    context.lineTo(-neckWidth / 2, tipLength)
    context.lineTo(-tipWidth / 2,  0)
    context.lineTo(0, 0)
    context.closePath()
  }
}

const hourHandSymbol = {
  draw: function(context, length) {
    const baseLength = 704,
      baseTipWidth = 0,
      baseTipLength = 204,
      baseNeckWidth = 132,
      baseWaistWidth = 30,
      baseTailLength = 0,
      baseTailWidth = 0

    const scale = length / baseLength,
      tipWidth = baseTipWidth * scale,
      tipLength = baseTipLength * scale,
      neckWidth = baseNeckWidth * scale,
      waistWidth = baseWaistWidth * scale,
      tailLength = baseTailLength * scale,
      tailWidth = baseTailWidth * scale

    context.moveTo(0, 0)
    context.lineTo(tipWidth / 2,  0)
    context.lineTo(neckWidth / 2, tipLength)
    context.lineTo(waistWidth / 2, length - tailLength)
    context.lineTo(tailWidth / 2,  length)
    context.lineTo(-tailWidth / 2,  length)
    context.lineTo(-waistWidth / 2, length - tailLength)
    context.lineTo(-neckWidth / 2, tipLength)
    context.lineTo(-tipWidth / 2,  0)
    context.lineTo(0, 0)
    context.closePath()
  }
}

const utcHandSymbol = {
  draw: function(context, length) {
    const baseLength = 268,
      baseTriangleWidth = 32,
      scale = length / baseLength,
      triangleWidth = baseTriangleWidth * scale,
      triangleHeight = (Math.sqrt(3) / 2) * triangleWidth

    context.moveTo(0, 0)
    context.lineTo(triangleWidth / 2,  triangleHeight)
    context.lineTo(0, triangleHeight)
    context.lineTo(0, length)
    context.lineTo(0, triangleHeight)
    context.lineTo(-triangleWidth / 2,  triangleHeight)
    context.lineTo(0, 0)
    context.closePath()
  }
}

const bezelTriangle = {
  draw: function(context, size){
    const wToHRatio = 52 / 22,
      w = Math.sqrt(size * wToHRatio),
      h = w / wToHRatio,
      cpxOffset = 6,
      cpyOffset = 9,
      cpx1 = w/-cpxOffset,
      cpy1 = h/-cpyOffset,
      cpx2 = w/cpxOffset,
      cpy2 = h/-cpyOffset
    context.moveTo(w/-2, 0)
    context.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, w/2, 0)
    context.lineTo(0, h)
    context.closePath()
  }
}

function ready() {
  function updateData() {
    now = new Date()
    handData[0].value = now.getUTCHours() + now.getUTCMinutes() / 60
    handData[1].value = (now.getHours() % 12) + now.getMinutes() / 60
    handData[2].value = now.getMinutes()
    handData[3].value = now.getSeconds()
  }

  const vb = 512, // viewBox w & h
    diameter = vb,
    radius = diameter / 2,
    bezelRadius = radius - 3, // Leave room for stroke
    rehautRadius = 218,
    dialRadius = 198,
    handsCoverRadius = dialRadius / 20,
    utcHandLength = dialRadius - 4,
    hourHandLength = dialRadius - 84,
    minuteHandLength = dialRadius - 20,
    secondHandLength = dialRadius - 12,
    secondTickStart = dialRadius,
    secondTickLength = -10,
    hourTickStart = dialRadius,
    hourTickLength = -18,
    secondLabelRadius = rehautRadius - 10,
    secondLabelYOffset = 1.5,
    hourLabelRadius = dialRadius - 48,
    hourLabelYOffset = 3,
    utcHourLabelRadius = bezelRadius - 28,
    utcHourLabelYOffset = 1.5,
    radians = Math.PI / 180

  const analog = d3.select("#analog")
    .append("svg")
    .attr("viewBox", [0, 0, vb, vb])

  const twelve = d3
    .scaleLinear()
    .range([0, 360])
    .domain([0, 12])

  const twentyFour = d3
    .scaleLinear()
    .range([0, 360])
    .domain([0, 24])

  const sixty = d3
    .scaleLinear()
    .range([0, 360])
    .domain([0, 60])

  const handData = [
    {
      type: "utc",
      value: 0,
      length: -utcHandLength,
      scale: twentyFour
    },
    {
      type: "hour",
      value: 0,
      length: -hourHandLength,
      scale: twelve
    },
    {
      type: "minute",
      value: 0,
      length: -minuteHandLength,
      scale: sixty
    },
    {
      type: "second",
      value: 0,
      length: -secondHandLength,
      scale: sixty
    }
  ]

  function drawAnalog() {
    updateData()

    const clock = analog
      .append("g")
      .attr("id", "clock")
      .attr("transform", `translate(${[radius, radius]})`)

    // Bezel
    clock
      .append("circle")
      .attr("class", "bezel")
      .attr("x", 0)
      .attr("y", 0)
      .attr("r", bezelRadius)

    // Rehaut
    clock
      .append("circle")
      .attr("class", "rehaut")
      .attr("x", 0)
      .attr("y", 0)
      .attr("r", rehautRadius)

    // Dial
    clock
      .append("circle")
      .attr("class", "dial")
      .attr("x", 0)
      .attr("y", 0)
      .attr("r", dialRadius)

    // Add tick marks for seconds
    clock
      .selectAll(".second-tick")
      .data(d3.range(0, 60))
      .enter()
      .append("line")
      .attr("class", "second-tick")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", secondTickStart)
      .attr("y2", secondTickStart + secondTickLength)
      .attr("transform", d => `rotate(${sixty(d)})`)

    // Add numeric labels for seconds
    clock
      .selectAll(".second-label")
      .data(d3.range(5, 61, 5))
      .enter()
      .append("text")
      .attr("class", "second-label")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("x", d => secondLabelRadius * Math.sin(sixty(d) * radians))
      .attr("y", d => -secondLabelRadius * Math.cos(sixty(d) * radians) + secondLabelYOffset)
      .attr("transform", d => {
        let a = sixty(d)
        a = (d > 15 && d < 45) ? (a + 180) % 360 : a
        const x = secondLabelRadius * Math.sin(sixty(d) * radians)
        const y = -secondLabelRadius * Math.cos(sixty(d) * radians) + secondLabelYOffset
        return `rotate(${a}, ${x}, ${y})`
      })
      .text(d => d)

    // Add tick marks for hours
    clock
      .selectAll(".hour-tick")
      .data(d3.range(0, 12))
      .enter()
      .append("line")
      .attr("class", "hour-tick")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", hourTickStart)
      .attr("y2", hourTickStart + hourTickLength)
      .attr("transform", d => `rotate(${twelve(d)})`)

    // Add numeric labels for hours
    clock
      .selectAll(".hour-label")
      .data(d3.range(1, 13, 1))
      .enter()
      .append("text")
      .attr("class", "hour-label")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("x", d => hourLabelRadius * Math.sin(twelve(d) * radians))
      .attr("y", d => -hourLabelRadius * Math.cos(twelve(d) * radians) + hourLabelYOffset)
      .text(d => d)

    // Add tick marks for UTC hours
    clock
      .selectAll(".utc-hour-tick")
      .data(d3.range(1, 25, 2))
      .enter()
      .append("circle")
      .attr("class", "utc-hour-tick")
      .attr("cx", d => (utcHourLabelRadius + 9) * Math.sin(twentyFour(d) * radians))
      .attr("cy", d => -(utcHourLabelRadius + 9) * Math.cos(twentyFour(d) * radians))
      .attr("r", 3)

    // Add numeric labels for UTC hours
    clock
      .selectAll(".utc-hour-label")
      .data(d3.range(2, 23, 2))
      .enter()
      .append("text")
      .attr("class", "utc-hour-label")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("x", d => (utcHourLabelRadius + 10) * Math.sin(twentyFour(d) * radians))
      .attr("y", d => -(utcHourLabelRadius + 10) * Math.cos(twentyFour(d) * radians) + utcHourLabelYOffset)
      .attr("transform", d => {
        let a = twentyFour(d)
        a = (d > 6 && d < 18) ? (a + 180) % 360 : a
        const x = (utcHourLabelRadius + 10) * Math.sin(twentyFour(d) * radians)
        const y = -(utcHourLabelRadius + 10) * Math.cos(twentyFour(d) * radians) + utcHourLabelYOffset
        return `rotate(${a}, ${x}, ${y})`
      })
      .text(d => d)

    // Bezel midnight triangle
    clock
      .append("path")
      .attr("class", "bezel-triangle")
      .attr("d", d3.symbol().type(bezelTriangle).size(480))
      .attr("transform", `translate(0, -${bezelRadius - 12})`)

    const hands = clock.append("g").attr("id", "clock-hands")

    // Add hand groups
    hands
      .selectAll("g.hand-group")
      .data(handData)
      .enter()
      .append("g")
      .attr("class", d => `hand-group hand-group-${d.type}`)
      .attr("transform", d => `rotate(${d.scale(d.value)})`)

    hands
      .select("g.hand-group-second")
      .append("path")
      .attr("class", "second-hand")
      .attr("d", d3.symbol().type(secondHandSymbol).size(secondHandLength))
      .attr("transform", `translate(0, -${secondHandLength})`)

    hands
      .select("g.hand-group-minute")
      .append("path")
      .attr("class", "minute-hand")
      .attr("d", d3.symbol().type(minuteHandSymbol).size(minuteHandLength))
      .attr("transform", `translate(0, -${minuteHandLength})`)

    hands
      .select("g.hand-group-hour")
      .append("path")
      .attr("class", "hour-hand")
      .attr("d", d3.symbol().type(hourHandSymbol).size(hourHandLength))
      .attr("transform", `translate(0, -${hourHandLength})`)

    hands
      .select("g.hand-group-utc")
      .append("path")
      .attr("class", "utc-hand")
      .attr("d", d3.symbol().type(utcHandSymbol).size(utcHandLength))
      .attr("transform", `translate(0, -${utcHandLength})`)

    // Hands cover
    clock
      .append("circle")
      .attr("class", "hands-cover")
      .attr("x", 0)
      .attr("y", 0)
      .attr("r", handsCoverRadius)
  }

  function drawDigital() {
    const localZone = tzName(now)
    const localTime = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => n.toString().padStart(2, "0")).join(":")
    const localWeekDay = now.toLocaleDateString("en-US", { weekday: "short" })
    const localDateStamp = now.toISOString().slice(0, 10)
    const localDate = `${localWeekDay} ${localDateStamp}`

    const utcZone = "UTC"
    const utcTime = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()].map(n => n.toString().padStart(2, "0")).join(":")
    const utcWeekDay = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(now)
    const utcDateStamp = [now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()].map(n => String(n).padStart(2, "0")).join("-")
    const utcDate = `${utcWeekDay} ${utcDateStamp}`

    d3.select("#local-zone").text(localZone)
    d3.select("#local-time").text(localTime)
    d3.select("#local-date").text(localDate)
    d3.select("#utc-zone").text(utcZone)
    d3.select("#utc-time").text(utcTime)
    d3.select("#utc-date").text(utcDate)
    d3.select("title").text(localTime)
  }

  function moveHands() {
    d3.select("#clock-hands")
      .selectAll("g.hand-group")
      .data(handData)
      .transition()
      .ease(d3.easeElastic.period(0.5))
      .attr("transform", d => `rotate(${d.scale(d.value)})`)

    drawDigital()
  }

  drawAnalog()
  drawDigital()

  const interval = setInterval(() => {
    updateData()
    moveHands()
  }, refreshRate)
}
ready()
