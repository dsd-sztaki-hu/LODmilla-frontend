/**
 * Created by Attila Gyorok on 2014.07.14..
 */

/**
 * Force based graph layout algorithm.
 * @param buffer Temporary solution is to prepare the data in a buffer structure. See "Buffer" class.
 * @param steps Number of steps the calculation takes.
 * @param max_time Maximum duration for the calculation in milliseconds.
 * @param min_distance Minimal distance between nodes.
 * @param grid_distance Grid distance between nodes.
 * @param spring_strain Increases the attractive force's strength linearly.
 * @param spring_length Decreases the attractive force's strength. Scales with logarithm.
 * @param spring_gravitation Increases the repulsive force's strength linearly.
 */
function springLayout(buffer, steps, max_time,  min_distance, grid_distance, spring_strain, spring_length, spring_gravitation) {
    var start_time = Date.now();
    var max = 1;
    var min = spring_gravitation, min0 = spring_gravitation;
    var a_cc = 0;
    for (var i = 0; i < buffer.vertexes.length; i++) {
        var a_node = buffer.getVertexByIndex(i);
        a_cc +=a_node.targets.length + a_node.sources.length;
    }
    if (a_cc < 1) a_cc = 1;
    a_cc /= buffer.vertexes.length;
    a_cc = a_cc * a_cc;
    max = iterativeMaxDistance(max, spring_strain, spring_length, min, a_cc) * min_distance;
    for (var i = 0; i < steps; i++) {
        if (Date.now() - start_time > max_time) break;
        if (Math.abs(min - min0) > min_distance) {
            min0 = min;
            max = iterativeMaxDistance(max, spring_strain, spring_length, min, a_cc) * min_distance;
        }
        min = calculateSpringStep(buffer, min_distance , spring_strain, spring_length, min, max);
        setNewPosition(buffer, grid_distance, spring_strain, spring_length, min);
    }
    setVisiblePosition(buffer);
}

function iterativeMaxDistance(prev, spring_strain, spring_length, spring_gravitation, average_connection)
{
    //Newton's method
    var i = 1, diff = 1;
    var ni = 1, ni1 = 1;
    var f, fd;
    var Eps = 0.01;
    do {
        f = spring_strain * Math.log(ni / spring_length) - spring_gravitation * average_connection / (ni * ni);
        fd = (ni * ni * spring_strain + 2 * spring_gravitation * average_connection) / (ni * ni * ni);
        ni1 = ni - f/fd;
        diff = ni1 - ni;
        ni = ni1;
        //i++;
    } while (diff > Eps)
    return ni;
}

function calculateSpringStep(buffer, min_distance, spring_strain, spring_length, spring_gravitation, max_distance)
{
    var i,j;
    var i_length = buffer.vertexes.length - 1;
    var j_length = buffer.vertexes.length;
    var i_node, j_node;
    var i_cc, j_cc, d_cc;
    var d_top, d_left, F, F_left, F_top, F_i, F_j;
    var distance, distance2;
    var min_count = 0, max_count = 0, count = 0;
    for (i = 0; i < i_length; i++)
    {
        i_node = buffer.getVertexByIndex(i);
        i_cc = i_node.targets.length + i_node.sources.length;
        if (i_cc < 1) i_cc = 1;
//        i_cc = 1 / i_cc;
        for (j = i + 1; j < j_length; j++ )
        {
            count++;
            j_node = buffer.getVertexByIndex(j);
            j_cc = j_node.targets.length + j_node.sources.length;
            d_cc = i_cc + j_cc;
            if (j_cc < 1) j_cc = 1;
//            j_cc = 1 / j_cc;
            if (d_cc < 1) d_cc = 1;
            else d_cc = d_cc * d_cc;
                //d_cc = (d_cc + Math.sqrt(d_cc)) * Math.sqrt(d_cc);
            d_left = Math.abs(i_node.left - j_node.left);
            d_top = Math.abs(i_node.top - j_node.top);
            distance2 = d_left * d_left + d_top * d_top;
            distance = Math.sqrt(distance2);
            if (distance < min_distance) {
                distance = min_distance;
                min_count++;
            }
            if (i_node.targets.indexOf(j) > -1 || j_node.targets.indexOf(i) > -1)
            {
                // pull
                F = spring_strain * Math.log(distance / spring_length)
                    - spring_gravitation * d_cc / distance2;
                F /= distance;
                F_left = F * d_left;
                F_top = F * d_top;
                F_i = F_left / i_node.weight / i_cc;
                F_j = F_left / j_node.weight / j_cc;
                if (i_node.left < j_node.left)
                {
                    i_node.diffLeft += F_i;
                    j_node.diffLeft -= F_j;
                }
                else
                {
                    i_node.diffLeft -= F_i;
                    j_node.diffLeft += F_j;
                }
                F_i = F_top / i_node.weight / i_cc;
                F_j = F_top / j_node.weight / j_cc;
                if (i_node.top < j_node.top)
                {
                    i_node.diffTop += F_i;
                    j_node.diffTop -= F_j;
                }
                else
                {
                    i_node.diffTop -= F_i;
                    j_node.diffTop += F_j;
                }
            }
            else
            {
            // push
            if (distance > max_distance)
            {
                max_count++;
                //continue;
            }
            F = spring_gravitation * d_cc / (distance2 * distance);
            F_left = F * d_left;
            F_top = F * d_top;
            F_i = F_left / i_node.weight / i_cc;
            F_j = F_left / j_node.weight / j_cc;
            if (i_node.left < j_node.left)
            {
                i_node.diffLeft -= F_i;
                j_node.diffLeft += F_j;
            }
            else
            {
                i_node.diffLeft += F_i;
                j_node.diffLeft -= F_j;
            }
            F_i = F_top / i_node.weight / i_cc;
            F_j = F_top / j_node.weight / j_cc;
            if (i_node.top < j_node.top)
            {
                i_node.diffTop -= F_i;
                j_node.diffTop += F_j;
            }
            else
            {
                i_node.diffTop += F_i;
                j_node.diffTop -= F_j;
            }
            }
        }
    }
    var ret = 1 + (min_count - max_count) / count;
    //if (ret < 1) return spring_gravitation;
    return spring_gravitation * ret;
}

function setNewPosition(buffer, min_distance, spring_strain, spring_length, spring_gravitation)
{
    for (var index in buffer.vertexes) {
        var act = buffer.vertexes[index];

        act.left += act.diffLeft;
        act.top += act.diffTop;
        act.diffLeft = 0;
        act.diffTop = 0;

        //pull to grid center
/*
        var to_top = min_distance * Math.floor((act.top) / min_distance) + (min_distance/2);
        var to_left = min_distance * Math.floor((act.left) / min_distance) + (min_distance/2);
        d_left = Math.abs(act.left - to_left);
        d_top = Math.abs(act.top - to_top);
        distance2 = d_left * d_left + d_top * d_top;
        distance = Math.sqrt(distance2);
        if (distance < 10) continue;
        F = spring_strain * Math.log(distance / spring_length) - (spring_gravitation / distance2);
        F /= distance;
        F_left = F * d_left;
        F_top = F * d_top;
        F_i = F_left / act.weight;
        if (act.left < to_left)
        {
            act.diffLeft += F_i;
        }
        else
        {
            act.diffLeft -= F_i;
        }
        F_i = F_top / act.weight;
        if (act.top < to_top)
        {
            act.diffTop += F_i;
        }
        else
        {
            act.diffTop -= F_i;
        }

        act.left += act.diffLeft;
        act.top += act.diffTop;
        act.diffLeft = 0;
        act.diffTop = 0;*/
    }
}

function setVisiblePosition(buffer)
{
    var original;
    for (var index in buffer.vertexes) {
        var act = buffer.vertexes[index];
        if (act.isvVirtual == false) {
            original = Graph.getNode(act.id);
            original.left = act.left;
            original.top = act.top;
        }
    }
}