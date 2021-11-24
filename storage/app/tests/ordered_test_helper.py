import unittest


def make_orderer():
    """
    This method assists us with writing integration tests using unittest
    The problem we're solving is executing tests in the order they're written in
    https://codereview.stackexchange.com/questions/122532/controlling-the-order-of-unittest-testcases
    """
    order = {}

    def ordered(f):
        order[f.__name__] = len(order)
        return f

    def compare(a, b):
        return [1, -1][order[a] < order[b]]

    return ordered, compare


ordered, compare = make_orderer()
unittest.defaultTestLoader.sortTestMethodsUsing = compare
