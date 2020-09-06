def arr_to_str(arr):
    if (isinstance(arr, str)):
        return arr
    return ','.join([str(elem) for elem in arr])


def inputs(dest, order, input_shape):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    with open(dest, "a") as file:
        file.write(
            f"input_{order} = Input(shape=({arr_to_str(input_shape)}))\n")
    return f"input_{order}"


def dense(dest, prev, order, num, activation="None", reg="None"):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    if (not (isinstance(activation, str) or activation is None)):
        raise TypeError('"activation" type must be a string.')
    if (not isinstance(num, int)):
        raise TypeError('"num" value must be an integer.')

    with open(dest, "a") as file:
        file.write(
            f"dense_{order} = Dense({num}, activation='{activation}', kernel_regularizer={reg})({prev})\n")
    return f"dense_{order}"


def dropout(dest, prev, order, rate):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    if (not isinstance(rate, int)):
        raise TypeError('"rate" value must be an integer.')
    with open(dest, "a") as file:
        file.write(
            f"dropout_{order} = Dropout({rate})({prev})\n")
    return f"dropout_{order}"


def flatten(dest, prev, order):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    with open(dest, "a") as file:
        file.write(
            f"flatten_{order} = Flatten()({prev})\n")
    return f"flatten_{order}"


def maxp2d(dest, prev, order, padding="valid", strides="None", pooling=[2, 2]):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    with open(dest, "a") as file:
        file.write(
            f"maxp2d_{order} = MaxPooling2D(padding={padding}, strides={arr_to_str(strides)}, pool_size=({arr_to_str(pooling)}))({prev})\n")
    return f"maxp2d_{order}"


def gmp2d(dest, prev, order):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    with open(dest, "a") as file:
        file.write(f"gmp2d_{order} = GlobalMaxPool2D()({prev})")
    return f"gmp2d_{order}"


def conv2d(dest, prev, order, num, rate, pooling, activation="None", padding="valid", strides="None"):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    if (not (isinstance(activation, str) or activation is None)):
        raise TypeError('"activation" type must be a string.')
    if (not isinstance(num, int)):
        raise TypeError('"num" value must be an integer.')
    with open(dest, "a") as file:
        file.write(
            f"conv2d_{order} = Conv2D({num}, kernel_size=({arr_to_str(pooling)}), padding={padding}, strides={arr_to_str(strides)})({prev})\n")
    return f"conv2d_{order}"


def vgg16(dest, prev, order, input_shape=[224, 224, 3], include_top="False"):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    with open(dest, "a") as file:
        file.write(
            f"vgg16_{order} = VGG16(include_top={include_top}, weights='imagenet', input_shape=({arr_to_str(input_shape)}))\n")
    return f"vgg16_{order}"


def vgg19(dest, prev, order, input_shape=[224, 224, 3], include_top="False"):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    with open(dest, "a") as file:
        file.write(
            f"vgg19_{order} = VGG19(include_top={include_top}, weights='imagenet', input_shape=({arr_to_str(input_shape)}))\n")
    return f"vgg19_{order}"


def resnet50(dest, num, order, input_shape=[224, 224, 3], include_top="False"):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')

    with open(dest, "a") as file:
        file.write(
            f"resnet50_{order}=ResNet50V2(include_top={include_top}, weights='imagenet', input_shape=({arr_to_str(input_shape)}))\n")
    return f"resnet50_{order}"


def effnetb0(dest, num, order, input_shape=[224, 224, 3], include_top="False"):
    if (not isinstance(dest, str)):
        raise TypeError('"dest" file path must be a string.')
    with open(dest, "a") as file:
        file.write(
            f"effnetb0_{order}=efn.EfficientNetB0(include_top={include_top},weights='imagenet', input_shape=({arr_to_str(input_shape)}))\n")

    return f"effnetb0_{order}.output"
