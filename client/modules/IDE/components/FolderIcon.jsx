import { FaChevronDown } from 'react-icons/fa6';
import { FaChevronRight } from 'react-icons/fa6';
import { BsThreeDotsVertical } from 'react-icons/bs';

import React from 'react';

export function FolderOpen() {
  return <FaChevronDown />;
}

export function FolderClose() {
  return <FaChevronRight />;
}

export function ShowOptionIcon() {
  return <BsThreeDotsVertical />;
}
